'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    let imageUrl = '';
    if (imageFile) {
      // Upload image to Vercel Blob for URL (or use a temp URL service)
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const { url } = await uploadRes.json();
      imageUrl = url;
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageUrl, mode: imageFile ? 'img' : 'text' }),
    });
    const { image } = await res.json();
    setGeneratedImage(image);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">AI Image Generator</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt"
        className="border p-2 mb-4 w-full"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button onClick={handleGenerate} disabled={loading} className="bg-blue-500 text-white p-2">
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {generatedImage && <img src={generatedImage} alt="Generated" className="mt-4" />}
    </div>
  );
}
