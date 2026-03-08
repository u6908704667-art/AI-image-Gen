'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Upload, Zap, Palette, Cpu, ArrowRight, Menu, X, Settings, Download, Copy, History, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [characterName, _setCharacterName] = useState('');
  const [style, setStyle] = useState('seinen');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [strictMode, setStrictMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [useConstraints, setUseConstraints] = useState(true);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-xl');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [steps, setSteps] = useState(20);
  const [guidance, setGuidance] = useState(7.5);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002';
        const res = await fetch(`${backendUrl}/api/models`);
        const data = await res.json();
        setAvailableModels(data.models || []);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const model = availableModels.find(m => m.id === selectedModel);
    setModelInfo(model);
  }, [selectedModel, availableModels]);

  const addToHistory = (image: string) => {
    setImageHistory(prev => [image, ...prev.slice(0, 9)]);
  };

  const addToFavorites = () => {
    if (generatedImage && !favorites.includes(generatedImage)) {
      setFavorites(prev => [generatedImage, ...prev]);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied!');
  };

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
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'}/api/upload`, { method: 'POST', body: formData });
      const { url } = await uploadRes.json();
      imageUrl = url;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'}/api/generate`, {
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
      addToHistory(image);
    } catch (error) {
      console.error('Generation failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Generation failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-600/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">NovaZone</h1>
                <p className="text-xs text-purple-300">AI Studio</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 transition-all border border-purple-500/20"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-b border-purple-500/20 bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <motion.button
                onClick={() => {setShowSettings(!showSettings); setMobileMenuOpen(false);}}
                className="w-full p-3 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 text-left flex items-center gap-2 transition-all"
              >
                <Settings className="w-5 h-5" />
                Advanced Settings
              </motion.button>
              <motion.button
                className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hero Section */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Create <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Anime Magic</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl">
                Generate stunning anime artwork with bleeding-edge AI. No limits. Pure creativity.
              </p>
            </div>

            {/* Prompt Input */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-sm font-bold text-purple-300 uppercase">Scene Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cyberpunk anime character standing in neon rain, intricate details, cinematic lighting..."
                rows={5}
                className="w-full px-5 py-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 resize-none backdrop-blur-sm hover:border-purple-500/50 transition-all"
              />
              <button
                onClick={copyPrompt}
                className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> Copy Prompt
              </button>
            </motion.div>

            {/* Model & Style Controls */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="space-y-3">
                <label className="text-sm font-bold text-purple-300 uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 backdrop-blur-sm"
                >
                  <option value="stable-diffusion-xl">Stable Diffusion XL</option>
                  <option value="flux-schnell">FLUX Schnell </option>
                  <option value="flux-pro">FLUX Pro </option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-purple-300 uppercase flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 backdrop-blur-sm"
                >
                  <option value="seinen">Seinen</option>
                  <option value="cyberpunk">Cyberpunk</option>
                  <option value="noir">Noir</option>
                </select>
              </div>
            </motion.div>

            {/* Advanced Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/30 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-lg font-bold text-purple-300">Advanced Settings</h3>
                  
                  <div>
                    <label className="text-sm text-purple-300 font-semibold">Seed: {seed}</label>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-purple-300 font-semibold">Steps: {steps}</label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-purple-300 font-semibold">Guidance Scale: {guidance.toFixed(1)}</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={guidance}
                      onChange={(e) => setGuidance(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* File Upload */}
            <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <label className="text-sm font-bold text-purple-300 uppercase">Reference Image</label>
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
                className="flex items-center justify-center gap-3 px-5 py-4 bg-slate-900/50 border-2 border-dashed border-purple-500/30 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-slate-900/70 transition-all group"
              >
                <Upload className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <span className="text-slate-300 group-hover:text-white font-semibold">
                  {fileName || 'Upload Image'}
                </span>
              </label>
            </motion.div>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerateClick}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
                loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white hover:shadow-2xl shadow-lg shadow-purple-500/30'
              }`}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Creating Masterpiece...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Image
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Right Panel - Preview & History */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-purple-300 uppercase">Live Preview</h3>
              <motion.div 
                className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/30 rounded-xl overflow-hidden flex items-center justify-center relative"
                whileHover={{ borderColor: '#a855f7' }}
              >
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                      <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                    </motion.div>
                  ) : (
                    <motion.div key="placeholder" className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <motion.div 
                        className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-8 h-8 text-purple-400" />
                      </motion.div>
                      <p className="text-slate-300 font-semibold">Ready to Create</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Action Buttons */}
              <AnimatePresence>
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-2"
                  >
                    <motion.a
                      href={generatedImage}
                      download="generated-image.png"
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg text-center flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" /> Download
                    </motion.a>
                    <motion.button
                      onClick={addToFavorites}
                      whileHover={{ scale: 1.05 }}
                      className="py-3 px-4 rounded-lg bg-slate-900/50 border-2 border-pink-500/30 text-pink-300 hover:border-pink-400 transition-all"
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History */}
            {imageHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-purple-300 uppercase flex items-center gap-2">
                  <History className="w-4 h-4" /> Recent
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {imageHistory.slice(0, 6).map((img, i) => (
                    <motion.img
                      key={i}
                      src={img}
                      alt={`History ${i}`}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setGeneratedImage(img)}
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer border-2 border-purple-500/20 hover:border-purple-400 transition-all"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-pink-300 uppercase">Favorites</h3>
                <div className="grid grid-cols-3 gap-2">
                  {favorites.slice(0, 3).map((img, i) => (
                    <motion.img
                      key={i}
                      src={img}
                      alt={`Favorite ${i}`}
                      whileHover={{ scale: 1.05 }}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-pink-500/30 hover:border-pink-400 transition-all cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative border-t border-purple-500/20 mt-20 backdrop-blur-xl bg-slate-950/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>Powered by Stable Diffusion   2026 NovaZone</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-semibold">System Online</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
