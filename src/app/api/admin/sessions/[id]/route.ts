import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${PYTHON_AI_URL}/session-detail?id=${encodeURIComponent(id)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Không tìm thấy session' }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết nối Python Server', details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const res = await fetch(`${PYTHON_AI_URL}/session-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: id, status: body.status || 'resolved' }),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Lỗi cập nhật trạng thái' }, { status: 500 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết nối Python Server', details: String(err) },
      { status: 500 }
    );
  }
}
