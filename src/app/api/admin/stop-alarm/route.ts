import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

export async function POST() {
  try {
    const res = await fetch(`${PYTHON_AI_URL}/stop-alarm`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ status: 'error' }, { status: 500 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết nối Python Server', details: String(err) },
      { status: 500 }
    );
  }
}
