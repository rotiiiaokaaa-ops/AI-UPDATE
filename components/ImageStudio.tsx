
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rahman_image_studio');
    if (saved) setImages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('rahman_image_studio', JSON.stringify(images));
  }, [images]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      if (url) {
        setImages(prev => [url, ...prev]);
        setPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImages = () => {
    if (window.confirm("Hapus semua foto?")) {
      setImages([]);
      localStorage.removeItem('rahman_image_studio');
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-[#0a0a0a] overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2 tracking-tighter italic">IMAGE STUDIO</h2>
        <p className="text-gray-500 text-sm">Hasilkan gambar berkualitas tinggi secara instan.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Jelaskan gambar yang kamu inginkan..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-8 rounded-2xl font-bold transition-all ${
            isGenerating ? 'bg-gray-700 animate-pulse' : 'bg-blue-600 hover:scale-105'
          }`}
        >
          {isGenerating ? '...' : 'GENERATE'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">HASIL GENERATE</h3>
          {images.length > 0 && (
            <button onClick={clearImages} className="text-xs text-red-500/50 hover:text-red-500">CLEAR ALL</button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-white/5">
              <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <a href={img} download={`rahman-ai-${i}.png`} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg">DOWNLOAD</a>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="aspect-square rounded-2xl bg-white/5 animate-pulse border border-white/10 flex items-center justify-center">
              <span className="text-xs text-gray-500">Rendering...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
