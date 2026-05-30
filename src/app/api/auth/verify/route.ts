import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '未提供认证Token' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Token无效或已过期' }, { status: 401 });
  }

  return NextResponse.json({
    valid: true,
    user: payload,
  });
}
