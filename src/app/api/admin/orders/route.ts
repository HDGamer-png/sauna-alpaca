import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_SERVER_URL}/orders`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Không thể kết nối Python AI Server' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi proxy GET /api/admin/orders:', error);
    return NextResponse.json({ orders: [], total: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${PYTHON_SERVER_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.error || 'Lỗi tạo đơn hàng' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi proxy POST /api/admin/orders:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
