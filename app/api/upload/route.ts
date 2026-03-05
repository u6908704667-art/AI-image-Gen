import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const { url } = await put(file.name, file, { access: 'public' });
  return NextResponse.json({ url });
}
