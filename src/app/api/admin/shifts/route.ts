import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_AI_URL}/admin/shifts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết nối máy chủ giám sát ca trực', details: String(err) },
      { status: 500 }
    );
  }
}
