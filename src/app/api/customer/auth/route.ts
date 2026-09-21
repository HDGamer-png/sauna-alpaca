import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${PYTHON_SERVER_URL}/customer-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errData.error || 'Không thể xác thực thông tin' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi proxy POST /api/customer/auth:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể kết nối đến máy chủ tiếp nhận' },
      { status: 500 }
    );
  }
}
