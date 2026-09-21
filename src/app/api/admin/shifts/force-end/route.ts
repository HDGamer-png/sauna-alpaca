import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${PYTHON_AI_URL}/admin/shifts/force-end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết thúc ca trực', details: String(err) },
      { status: 500 }
    );
  }
}
