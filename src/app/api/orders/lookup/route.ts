import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({ found: false, order: null });
    }

    const res = await fetch(`${PYTHON_SERVER_URL}/lookup-order?q=${encodeURIComponent(q.trim())}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ found: false, order: null });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi proxy GET /api/orders/lookup:', error);
    return NextResponse.json({ found: false, order: null });
  }
}
