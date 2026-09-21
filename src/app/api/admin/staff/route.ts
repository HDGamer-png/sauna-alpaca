import { NextResponse } from 'next/server';

const PYTHON_AI_URL = 'http://127.0.0.1:8000';

// GET: Lấy danh sách nhân viên
export async function GET() {
  try {
    const res = await fetch(`${PYTHON_AI_URL}/admin/staff`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể kết nối máy chủ nhân sự', details: String(err) },
      { status: 500 }
    );
  }
}

// POST: Chủ tạo mới nhân viên
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${PYTHON_AI_URL}/admin/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể tạo nhân viên mới', details: String(err) },
      { status: 500 }
    );
  }
}

// PUT: Chủ cập nhật thông tin / mật khẩu nhân viên
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${PYTHON_AI_URL}/admin/staff/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể cập nhật nhân viên', details: String(err) },
      { status: 500 }
    );
  }
}

// DELETE: Chủ xóa tài khoản nhân viên
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${PYTHON_AI_URL}/admin/staff/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không thể xóa nhân viên', details: String(err) },
      { status: 500 }
    );
  }
}
