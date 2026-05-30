import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/auth';

export async function GET() {
  const captchaData = generateCaptcha();
  return NextResponse.json({
    captchaId: captchaData.id,
    svg: captchaData.svg,
  });
}
