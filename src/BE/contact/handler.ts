import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * API Route: POST /api/contact
 * Nhận form liên hệ từ khách hàng → Gửi email thông báo về Gmail.
 *
 * Flow:
 * 1. Validate dữ liệu từ form
 * 2. Kiểm tra honeypot (chống spam bot)
 * 3. Gửi email thông báo về NOTIFY_EMAIL
 * 4. Gửi email xác nhận cho khách (nếu có email)
 */

// Rate limiting đơn giản bằng Map
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // Tối đa 5 lần/15 phút mỗi IP
const RATE_WINDOW = 15 * 60 * 1000; // 15 phút

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// Tạo transporter Nodemailer (cache lại)
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// Map nhu cầu sang tiếng Việt
function getNhuCauLabel(nhuCau: string): string {
  const map: Record<string, string> = {
    mua: '🏠 Mua thiết bị',
    thue: '📋 Thuê theo tháng',
    tuvan: '💬 Chỉ tư vấn',
  };
  return map[nhuCau] || nhuCau;
}

// Map gói thuê sang tiếng Việt
function getGoiThueLabel(goiThue?: string): string {
  if (!goiThue) return '';
  const map: Record<string, string> = {
    '3thang': 'Gói 3 tháng (Trải nghiệm ngắn hạn)',
    '6thang': 'Gói 6 tháng (Phổ biến ⭐)',
    '12thang': 'Gói 12 tháng (Tiết kiệm 25%)',
  };
  return map[goiThue] || goiThue;
}


export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();
    const { hoTen, soDienThoai, diaChi, nhuCau, goiThue, ghiChu, website } = body;

    // 2. Honeypot check
    if (website) {
      // Bot detected — trả về success giả
      return NextResponse.json({ success: true, message: 'Cảm ơn bạn!' });
    }

    // 3. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' },
        { status: 429 }
      );
    }

    // 4. Validate
    const errors: string[] = [];
    if (!hoTen || hoTen.trim().length < 2) errors.push('Họ tên không hợp lệ');
    if (!soDienThoai || !/^(0[3|5|7|8|9])[0-9]{8}$/.test(soDienThoai))
      errors.push('Số điện thoại không hợp lệ');
    if (!diaChi || diaChi.trim().length < 5) errors.push('Địa chỉ không hợp lệ');
    if (!nhuCau || !['mua', 'thue', 'tuvan'].includes(nhuCau))
      errors.push('Nhu cầu không hợp lệ');

    if (errors.length > 0) {
      return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }

    // 5. Tạo nội dung email
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const nhuCauLabel = getNhuCauLabel(nhuCau);

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🎋 Đơn đăng ký mới — Sauna Alpaca</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Nhận lúc: ${now}</p>
        </div>

        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; width: 35%; color: #374151;">👤 Họ tên</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-size: 16px;">${hoTen}</td>
            </tr>
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">📞 Điện thoại</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6;">
                <a href="tel:${soDienThoai}" style="color: #1B5E20; font-weight: 700; font-size: 18px; text-decoration: none;">${soDienThoai}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">📍 Địa chỉ</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6;">${diaChi}</td>
            </tr>
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">🎯 Nhu cầu</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #D4872C;">${nhuCauLabel}</td>
            </tr>
            ${goiThue ? `
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">📋 Gói thuê</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #2D6A4F;">${getGoiThueLabel(goiThue)}</td>
            </tr>` : ''}
            ${ghiChu ? `
            <tr>
              <td style="padding: 12px 8px; font-weight: 600; color: #374151;">📝 Ghi chú</td>
              <td style="padding: 12px 8px;">${ghiChu}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="background: #FEF3C7; padding: 16px 24px; border-top: 1px solid #FCD34D;">
          <p style="margin: 0; font-size: 14px; color: #92400E;">
            ⏰ <strong>Hãy gọi lại cho khách trong vòng 5 phút!</strong> Bấm vào số điện thoại phía trên để gọi ngay.
          </p>
        </div>
      </div>
    `;

    // 6. Gửi email
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = getTransporter();

      await transporter.sendMail({
        from: `"Sauna Alpaca" <${process.env.GMAIL_USER}>`,
        to: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER,
        subject: `🔔 Đơn mới: ${hoTen} — ${nhuCauLabel}`,
        html: emailHtml,
        replyTo: undefined, // Khách không cung cấp email
      });

      console.log(`✅ Email sent for: ${hoTen} - ${soDienThoai}`);
    } else {
      // Dev mode — log ra console
      console.log('📧 [DEV MODE] Email would be sent:');
      console.log({ hoTen, soDienThoai, diaChi, nhuCau, goiThue, ghiChu, timestamp: now });
    }

    return NextResponse.json({
      success: true,
      message: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.',
    });
  } catch (error) {
    console.error('❌ Contact API error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.' },
      { status: 500 }
    );
  }
}
