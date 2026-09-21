import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ messages: [] });
    }

    const res = await fetch(`${PYTHON_AI_URL}/customer-poll?id=${encodeURIComponent(sessionId)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ messages: [] });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { message, history, sessionId, customerPhone, customerName } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Vui lòng nhập câu hỏi để Trợ lý AI có thể giải đáp cho bạn nhé!' },
        { status: 400 }
      );
    }

    try {
      // 1. Thử gọi sang Server Python độc lập đang chạy tại localhost:8000
      const pyResponse = await fetch(`${PYTHON_AI_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          session_id: sessionId,
          customer_phone: customerPhone,
          customer_name: customerName,
        }),
        signal: AbortSignal.timeout(4000), // Timeout 4s nếu server Python chưa mở
      });

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        return NextResponse.json({
          reply: pyData.reply,
          source: 'python-local',
          intent: pyData.intent,
          sessionId: pyData.session_id || sessionId,
          escalated: pyData.escalated ?? false,
          priority: pyData.priority ?? 'normal',
          alert_type: pyData.alert_type ?? null,
        });
      }
    } catch {
      // Server Python chưa bật -> Chuyển sang cơ chế dự phòng nội bộ
      console.log('⚠️ [Next.js Chat API]: Python server (127.0.0.1:8000) chưa kết nối, sử dụng Fallback Engine.');
    }

    // 2. Fallback Engine khi chưa bật server Python
    const lower = message.toLowerCase();

    // Bắt số điện thoại trong fallback
    const phoneMatch = message.match(/(?:\+84|84|0)(?:3|5|7|8|9)[0-9]{8}\b/);
    if (phoneMatch) {
      return NextResponse.json({
        reply: `Dạ chuyên viên Sauna Alpaca đã ghi nhận số điện thoại ${phoneMatch[0]} của bạn! Chúng tôi đã chuyển thông tin tới chuyên viên tại Huế và sẽ liên hệ lại qua Zalo/Điện thoại trong vòng 15 phút nhé. Cảm ơn bạn!`,
        source: 'fallback',
        intent: 'lead_captured',
        escalated: true,
        priority: 'urgent',
        alert_type: 'LEAD_PHONE',
      });
    }

    // Ý định mua / cọc / gặp người thật trong fallback
    if (lower.includes('người thật') || lower.includes('nhân viên') || lower.includes('gặp trực tiếp') || lower.includes('tư vấn viên')) {
      return NextResponse.json({
        reply: 'Dạ vâng, tín hiệu yêu cầu hỗ trợ đã được chuyển tới chuyên viên tư vấn tại TP. Huế! 🔔 Bạn có thể để lại số điện thoại tại đây hoặc bấm gọi trực tiếp Hotline 0385.927.274 để trao đổi ngay nhé.',
        source: 'fallback',
        intent: 'human_request',
        escalated: true,
        priority: 'high',
        alert_type: 'HUMAN_REQUEST',
      });
    }

    if (lower.includes('mua ngay') || lower.includes('thuê ngay') || lower.includes('tài khoản') || lower.includes('đặt cọc') || lower.includes('stk')) {
      return NextResponse.json({
        reply: 'Dạ tuyệt vời ạ! Đội ngũ Sauna Alpaca tại Huế đã nhận được tín hiệu đặt máy của bạn. Chúng tôi hỗ trợ giao và lắp đặt miễn phí trong ngày tại TP. Huế. Bạn vui lòng để lại số điện thoại hoặc gọi hotline 0385.927.274 để nhân viên xếp lịch kỹ thuật viên ngay nhé!',
        source: 'fallback',
        intent: 'urgent_purchase',
        escalated: true,
        priority: 'urgent',
        alert_type: 'URGENT_PURCHASE',
      });
    }

    if (lower.includes('thận') || lower.includes('chạy thận') || lower.includes('avf')) {
      return NextResponse.json({
        reply:
          'Liệu pháp hồng ngoại xa (FIR 5.6 - 15μm) đã được nghiên cứu lâm sàng (JASN - Hoa Kỳ): Hỗ trợ giãn nở vi mạch, tăng sinh Oxit Nitric (NO), cải thiện lưu lượng máu qua đường mổ AVF ở bệnh nhân chạy thận. Tuy nhiên máy xông hơi là thiết bị gia dụng hỗ trợ, gia đình cần tham khảo ý kiến bác sĩ điều trị trước khi xông nhé!',
        source: 'fallback',
        intent: 'benh_than_fir',
        escalated: false,
      });
    }

    if (lower.includes('thuê') || lower.includes('giá') || lower.includes('chi phí')) {
      return NextResponse.json({
        reply:
          'Sauna Alpaca đang thí điểm 3 gói thuê tại Huế: Gói 3 tháng (trải nghiệm), Gói 6 tháng (được chọn nhiều nhất) và Gói 12 tháng (tiết kiệm đến 25%). Tất cả các gói đều miễn phí vận chuyển, bảo dưỡng định kỳ và đổi máy mới nếu có lỗi.',
        source: 'fallback',
        intent: 'goi_thue_hue',
        escalated: false,
      });
    }

    if (lower.includes('nhiệt độ') || lower.includes('người già') || lower.includes('lớn tuổi')) {
      return NextResponse.json({
        reply:
          'Người lớn tuổi được khuyến nghị xông ở mức nhiệt êm dịu từ 40°C đến 50°C trong khoảng 15 - 20 phút mỗi lần. Máy xông hơi tre Sauna Alpaca có cảm biến ngắt an toàn kép và hẹn giờ tự động, người nhà hoàn toàn có thể yên tâm.',
        source: 'fallback',
        intent: 'nguoi_cao_tuoi_nhiet_do',
        escalated: false,
      });
    }

    if (lower.includes('lắp') || lower.includes('huế') || lower.includes('diện tích')) {
      return NextResponse.json({
        reply:
          'Kỹ thuật viên tại Huế sẽ giao hàng và lắp đặt hoàn thiện tận nhà trong 30 - 60 phút. Máy xông hơi tre chỉ chiếm 1m² diện tích và dùng ổ cắm điện 220V gia đình thông thường, không cần sửa đổi nhà cửa.',
        source: 'fallback',
        intent: 'lap_dat_khong_gian',
        escalated: false,
      });
    }

    return NextResponse.json({
      reply: `Cảm ơn câu hỏi của bạn về "${message}". Đội ngũ chuyên viên Sauna Alpaca tại Huế luôn sẵn sàng tư vấn chi tiết hơn qua hotline 0385.927.274 hoặc bạn có thể để lại số điện thoại tại đây để chúng tôi hỗ trợ nhé!`,
      source: 'fallback',
      intent: 'fallback',
      escalated: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        reply:
          'Rất tiếc, đã có gián đoạn kết nối. Bạn vui lòng thử lại hoặc gọi trực tiếp hotline 0385.927.274 nhé!',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
