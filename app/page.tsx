'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Upload, Zap, Lock, Palette, Cpu } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [style, setStyle] = useState('seinen');
  const [strictMode, setStrictMode] = useState(false);
  const [useConstraints, setUseConstraints] = useState(true);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-xl');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('http://localhost:8002/api/models');
        const data = await res.json();
        setAvailableModels(data.models || []);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    fetchModels();
  }, []);

  // Update model info when selected model changes
  useEffect(() => {
    const model = availableModels.find(m => m.id === selectedModel);
    setModelInfo(model);
  }, [selectedModel, availableModels]);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt to generate an image');
      return;
    }
    await handleGenerate();
  };

  const handleGenerate = async () => {
    setLoading(true);
    let imageUrl = '';
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadRes = await fetch('http://localhost:8002/api/upload', { method: 'POST', body: formData });
      const { url } = await uploadRes.json();
      imageUrl = url;
    }

    try {
      const res = await fetch('http://localhost:8002/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageUrl,
          mode: imageFile ? 'img' : 'text',
          character: characterName || null,
          style,
          strict_mode: strictMode,
          use_constraints: useConstraints,
          model: selectedModel
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { image, error } = await res.json();
      if (error) {
        throw new Error(error);
      }
      setGeneratedImage(image);
    } catch (error) {
      console.error('Generation failed:', error);
      alert(`Generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-cyan-900/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-950" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
                NovaZone XI
              </h1>
            </div>
            <div className="text-sm text-cyan-400/70">v1.0</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Create Anime Masterpieces</h2>
              <p className="text-cyan-400/70">Generate stunning anime art with cutting-edge AI technology</p>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              {/* Constraints Header */}
              {useConstraints && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 text-sm font-semibold">Constraints Active</p>
                    <p className="text-green-400/70 text-xs mt-1">
                      {characterName ? `Character Lock: ${characterName} (${strictMode ? 'STRICT' : 'Relaxed'})` : `Style Lock: ${style}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Constraint Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Enable Constraints Toggle */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Enable Constraints
                  </label>
                  <button
                    onClick={() => setUseConstraints(!useConstraints)}
                    className={`w-full py-2 px-3 rounded-lg font-semibold transition-all text-sm ${
                      useConstraints
                        ? 'bg-green-500/20 border border-green-500 text-green-400'
                        : 'bg-slate-900/50 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {useConstraints ? '✓ Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Character Name Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="e.g., Bulma, Motoko"
                    disabled={!useConstraints}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Style Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-4 h-4" /> Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={!useConstraints || !!characterName}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="seinen">Seinen (1990s Cyberpunk)</option>
                    <option value="cyberpunk">Cyberpunk (Neon)</option>
                    <option value="noir">Noir (Dark & Moody)</option>
                    <option value="cyberpunk_noir">Cyberpunk Noir (Fusion)</option>
                  </select>
                </div>

                {/* Model Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-4 h-4" /> AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  >
                    <option value="stable-diffusion-xl">Stable Diffusion XL (HF)</option>
                    <option value="stable-diffusion-2">Stable Diffusion 2.1 (HF)</option>
                    <option value="z-image-turbo">Z-Image Turbo (FAL-AI) 🚀</option>
                    <option value="flux-pro">FLUX Pro (FAL-AI) ✨</option>
                    <option value="flux-realism">FLUX Realism (FAL-AI) 📸</option>
                  </select>
                </div>

                {/* Model Info Card */}
                {modelInfo && (
                  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-cyan-400 text-sm">{modelInfo.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">{modelInfo.provider}</span>
                    </div>
                    <p className="text-xs text-slate-400">{modelInfo.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-400"><strong>Speed:</strong> {modelInfo.speed}</span>
                      <span className="text-yellow-400"><strong>Quality:</strong> {modelInfo.quality}</span>
                    </div>
                    {modelInfo.features && (
                      <div className="flex flex-wrap gap-1">
                        {modelInfo.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Strict Mode Toggle (Only for Character) */}
              {characterName && useConstraints && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <button
                    onClick={() => setStrictMode(!strictMode)}
                    className="w-full flex items-center justify-between p-3 hover:bg-red-900/30 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-400" />
                      <div className="text-left">
                        <p className="font-semibold text-red-400">Strict Mode</p>
                        <p className="text-xs text-red-400/70">No deviations from character specs</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                      strictMode
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {strictMode ? 'ON' : 'OFF'}
                    </div>
                  </button>
                </div>
              )}

              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                  Scene Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your anime scene... (e.g., 'A cyberpunk city at night with glowing neon lights, detailed architecture, cinematic lighting')"
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                  Reference Image (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] || null);
                      setFileName(e.target.files?.[0]?.name || '');
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/50 border-2 border-dashed border-cyan-500/30 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-slate-900/70 transition-all group"
                  >
                    <Upload className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      {fileName || 'Upload Image for Style Transfer'}
                    </span>
                  </label>
                </div>
                {fileName && (
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setFileName('');
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateClick}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-bold uppercase tracking-wider text-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-green-400 text-slate-950 hover:from-cyan-300 hover:to-green-300 hover:shadow-lg hover:shadow-cyan-400/50 active:scale-95'
                }`}
              >
                <Zap className="w-5 h-5" />
                {loading ? 'Generating...' : 'Generate Frame'}
              </button>

              {/* Info */}
              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-cyan-400 text-sm">
                  💡 <span className="font-semibold">Tip:</span> Be descriptive with your scene details. Include lighting, style, composition, and mood for best results.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            {/* Preview Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Live Preview
              </h3>
              <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-lg overflow-hidden flex items-center justify-center relative">
                {generatedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-cyan-400/20 to-green-400/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">NovaZone Ready</p>
                      <p className="text-slate-600 text-xs mt-1">Enter your description and click Generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Button */}
            {generatedImage && (
              <a
                href={generatedImage}
                download="generated-image.png"
                className="w-full py-3 px-6 rounded-lg bg-slate-800 border border-cyan-500/30 text-cyan-400 font-semibold hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-all text-center"
              >
                ⬇️ Download Image
              </a>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400">NovaZone</div>
                <div className="text-xs text-slate-500 mt-1">AI Engine</div>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">XI</div>
                <div className="text-xs text-slate-500 mt-1">Real-time</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-900/30 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              Powered by Stable Diffusion XL • © 2026 NovaZone XI Merchandise
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400">System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
