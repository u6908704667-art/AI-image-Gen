import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { prompt, imageUrl, mode } = await req.json();  // mode: 'text' or 'img'
  const model = mode === 'img' ? process.env.NEXT_PUBLIC_MODEL_IMG : process.env.NEXT_PUBLIC_MODEL_TEXT;
  const token = process.env.HUGGINGFACE_API_TOKEN;

  try {
    const inputs = mode === 'img' ? { prompt, image: imageUrl } : { prompt };
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      inputs,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',  // For binary image data
      }
    );

    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
