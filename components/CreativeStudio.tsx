
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';

const CreativeStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [items, setItems] = useState<{url: string, type: 'image', prompt: string, id: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rahman_creative_studio');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out any legacy video items
        const filtered = parsed.filter((item: any) => item.type === 'image');
        setItems(filtered);
      } catch (e) {
        console.error("Gagal memuat arsip", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rahman_creative_studio', JSON.stringify(items));
  }, [items]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setErrorMessage(null);

    setIsGenerating(true);
    const messages = [
      "Mengumpulkan energi kosmik...",
      "Menyusun atom piksel...",
      "Meresapi imajinasi Anda...",
      "Hampir selesai, mahakarya sedang dibuat...",
      "Menyempurnakan detail akhir..."
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setStatusMessage(messages[msgIndex]);
      msgIndex = (msgIndex + 1) % messages.length;
    }, 3000);

    try {
      const url = await generateImage(prompt);
      if (url) {
        setItems(prev => [{url, type: 'image', prompt, id: Date.now().toString()}, ...prev]);
        setPrompt('');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
        setErrorMessage("BATAS KUOTA HABIS! Sabar, kuota API gratisan abis. Tunggu 1 menit ya.");
      } else {
        setErrorMessage('Gagal membuat gambar. Coba lagi nanti.');
      }
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearItems = () => {
    if (window.confirm("Bersihkan seluruh mahakarya foto Anda?")) {
      setItems([]);
      localStorage.removeItem('rahman_creative_studio');
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-[#050505] overflow-hidden">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">IMAGE STUDIO</h2>
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-black">UNLIMITED AI IMAGE PRODUCTION</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-500/40 rounded-2xl text-[10px] font-black text-red-400 uppercase leading-relaxed animate-bounce text-center">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Jelaskan secara detail gambar impianmu..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm group-hover:bg-white/[0.07]"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          {isGenerating && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 animate-pulse tracking-widest uppercase italic">
              {statusMessage}
            </div>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-12 py-5 rounded-2xl font-black text-xs tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl ${
            isGenerating 
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
          }`}
        >
          {isGenerating ? 'PRODUCING...' : 'GENERATE IMAGE'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">ARCHIVE / {items.length} IMAGES</h3>
          {items.length > 0 && (
            <button onClick={clearItems} className="text-[10px] text-red-500/60 font-black uppercase tracking-widest hover:text-red-500 transition-colors">WIPE ALL</button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl animate-fadeIn transition-transform hover:scale-[1.02]">
              <div className="aspect-square bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.prompt} />
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >✕</button>
              </div>
              <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5">
                <p className="text-[11px] text-white/50 line-clamp-2 mb-4 italic font-medium leading-relaxed">"{item.prompt}"</p>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] italic">rahman ai original</span>
                  <a 
                    href={item.url} 
                    download={`rahman-ai-${item.id}.png`} 
                    className="text-[10px] font-black bg-white text-black px-5 py-2 rounded-xl hover:bg-blue-400 transition-all hover:text-white"
                  >SAVE</a>
                </div>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="aspect-square rounded-[2rem] bg-white/[0.02] animate-pulse border-2 border-dashed border-blue-500/20 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full animate-ping bg-blue-400"></div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Processing...</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest px-8 leading-relaxed">Sistem RahmanAi sedang merancang visual masa depan Anda</p>
              </div>
            </div>
          )}
        </div>

        {items.length === 0 && !isGenerating && (
          <div className="h-80 flex flex-col items-center justify-center opacity-10 text-center">
            <span className="text-8xl mb-6">🎨</span>
            <p className="text-sm font-black uppercase tracking-[0.6em]">MAHAKARYA FOTO<br/>BELUM TERSEDIA</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeStudio;
