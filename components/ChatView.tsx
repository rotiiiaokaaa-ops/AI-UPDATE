
import React, { useState, useEffect, useRef } from 'react';
import { Persona, Message } from '../types';
import { generateResponse } from '../services/geminiService';

interface ChatViewProps {
  persona: Persona;
}

const ChatView: React.FC<ChatViewProps> = ({ persona }) => {
  const storageKey = `rahman_chat_${persona}`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      resetToWelcome();
    }
  }, [persona, storageKey]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, storageKey]);

  const resetToWelcome = () => {
    const welcome = persona === 'sopan' 
      ? "Halo! Saya RahmanAi yang sopan. Ada yang bisa saya bantu hari ini? 😊" 
      : "Ngapain lo ke sini? Buruan, gue gak punya banyak waktu buat pecundang kayak lo! 🤬";
    
    const welcomeMsg: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: welcome,
      timestamp: Date.now()
    };
    setMessages([welcomeMsg]);
    localStorage.setItem(storageKey, JSON.stringify([welcomeMsg]));
  };

  const handleSend = async () => {
    if (!input.trim() && images.length === 0) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      images: [...images],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImages([]);
    setIsLoading(true);

    try {
      const response = await generateResponse(persona, input, messages, userMsg.images);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || '...',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      let errorText = "Terjadi kesalahan.";
      if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
        errorText = "BATAS KUOTA HABIS! AI Rahman lagi istirahat sebentar (1 menit). Sabar ya.";
      }
      
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: errorText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const clearChat = () => {
    if (window.confirm("Hapus semua riwayat percakapan?")) {
      localStorage.removeItem(storageKey);
      resetToWelcome();
    }
  };

  const accentColor = persona === 'galak' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`flex flex-col h-full ${persona === 'galak' ? 'bg-[#0f0000]' : 'bg-[#00040f]'}`}>
      <div className={`p-4 border-b ${persona === 'galak' ? 'border-red-900/30' : 'border-blue-900/30'} flex justify-between items-center bg-black/40`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${persona === 'galak' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          <h2 className={`font-bold uppercase tracking-widest text-xs ${persona === 'galak' ? 'text-red-500' : 'text-blue-400'}`}>
            RahmanAi Mode: {persona}
          </h2>
        </div>
        <button onClick={clearChat} className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:bg-red-500 transition-all">Reset Memory</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-xl ${
              m.role === 'user' 
              ? 'bg-white/5 border border-white/10' 
              : `${persona === 'galak' ? 'bg-red-950/40 border border-red-900/50 text-red-100' : 'bg-blue-950/40 border border-blue-900/50 text-blue-50'}`
            }`}>
              {m.images && m.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {m.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} className="w-32 h-32 object-cover rounded-lg border border-white/10" alt="upload" />
                      <div className="absolute top-0 left-0 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-tl-lg rounded-br-lg uppercase">IMG {i+1}</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</p>
              <div className="mt-2 text-[8px] opacity-30 text-right">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-2xl animate-pulse ${persona === 'galak' ? 'bg-red-900/20' : 'bg-blue-900/20'}`}>
              <span className="text-xs font-bold uppercase tracking-widest">Berpikir...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        {images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
            {images.map((img, i) => (
              <div key={i} className="relative shrink-0">
                <img src={img} className="w-20 h-20 object-cover rounded-xl border border-white/20" />
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-tl-xl rounded-br-lg shadow-lg">IMG {i+1}</div>
                <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-white shadow-lg">✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <label className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-all border border-white/10 shrink-0">
            📷 <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Tanya RahmanAi...`}
            className={`flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 resize-none focus:outline-none focus:ring-1 transition-all text-sm ${persona === 'galak' ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            rows={1}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <button onClick={handleSend} disabled={isLoading} className={`px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${accentColor} shadow-lg active:scale-95 disabled:opacity-50 shrink-0`}>
            {isLoading ? '...' : 'SEND'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
