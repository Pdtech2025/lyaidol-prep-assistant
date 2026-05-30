import { NextRequest, NextResponse } from 'next/server';
import { verifyCaptcha, aesDecrypt, verifyPassword, findUserByUsername, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, captchaId, captchaAnswer } = body;

    // 1. 参数校验
    if (!username || !password || !captchaId || !captchaAnswer) {
      return NextResponse.json({ error: '请填写所有必填项' }, { status: 400 });
    }

    // 2. 验证码校验
    if (!verifyCaptcha(captchaId, captchaAnswer)) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 401 });
    }

    // 3. 解密前端AES加密的密码
    let plainPassword: string;
    try {
      plainPassword = aesDecrypt(password);
    } catch {
      // 如果解密失败，可能是未加密的明文（开发调试用）
      plainPassword = password;
    }

    // 4. 用户查找
    const user = findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // 5. 账号状态检查
    if (user.status === 'disabled') {
      return NextResponse.json({ error: '账号已被禁用，请联系管理员' }, { status: 403 });
    }

    // 6. 密码验证 (PBKDF2-SHA512)
    if (!verifyPassword(plainPassword, user.passwordHash)) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // 7. 签发JWT Token
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
    });

    // 8. 返回Token和用户信息（不含密码）
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        realName: user.realName,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
