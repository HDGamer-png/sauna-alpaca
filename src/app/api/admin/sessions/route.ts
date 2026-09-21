import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_AI_URL}/sessions`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ sessions: [], total: 0 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết nối Python Server', details: String(err), sessions: [], total: 0 },
      { status: 500 }
    );
  }
}
