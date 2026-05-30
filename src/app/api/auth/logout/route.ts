import { NextResponse } from 'next/server';

export async function POST() {
  // 客户端清除Token即可，服务端无状态
  return NextResponse.json({ success: true, message: '已退出登录' });
}
