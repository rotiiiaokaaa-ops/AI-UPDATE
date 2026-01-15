
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { generateGroupChatInteraction } from '../services/geminiService';

const GroupChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const randomUsers = ["Asep_Gaming", "Siti_Chantik", "ProPlayer99", "Budi_Ganteng", "Anon_Toxic", "LoverAI", "HaterDunia", "Rahman_Fanboy"];

  useEffect(() => {
    const saved = localStorage.getItem('rahman_group_chat');
    if (saved) setMessages(JSON.parse(saved));
    else {
      resetHistory();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('rahman_group_chat', JSON.stringify(messages));
    }
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const resetHistory = () => {
    const defaultMsg: Message = {
      id: '1',
      role: 'assistant',
      senderName: 'Siti_Chantik',
      content: 'Halo guys, RahmanAi keren banget ya!',
      timestamp: Date.now() - 50000
    };
    setMessages([defaultMsg]);
    localStorage.setItem('rahman_group_chat', JSON.stringify([defaultMsg]));
  };

  const clearHistory = () => {
    if (window.confirm("Hapus seluruh riwayat grup chat?")) {
      localStorage.removeItem('rahman_group_chat');
      resetHistory();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
        const randomTexts = [
          "Mantap parah sih ini web builder nya", "Woy RahmanAi kok galak banget!", "Gila, ini buatan anak SMP beneran?",
          "Hoax kali, palingan make template", "Yaelah gini doang gue juga bisa", "Semangat terus Rahman!",
          "Ada yang tau cara hostingnya?", "Bagus banget sumpah", "Parah, si Galak maki-maki gue mulu wkwk"
        ];
        const msg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          senderName: randomUser,
          content: randomTexts[Math.floor(Math.random() * randomTexts.length)],
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, msg].slice(-100));
      }
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      senderName: 'User_Real',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const bots = await generateGroupChatInteraction(input, messages.slice(-5));
      const responses: Message[] = bots.map((bot: any, idx: number) => ({
        id: (Date.now() + idx + 10).toString(),
        role: 'assistant',
        senderName: bot.name,
        content: bot.text,
        timestamp: Date.now() + (idx * 500)
      }));
      setMessages(prev => [...prev, ...responses]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 flex justify-between items-center">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <span className="p-1 bg-green-500 rounded-full animate-pulse"></span>
          GRUP CHAT PENGGUNA RAHMAN AI
        </h2>
        <button onClick={clearHistory} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full border border-red-500/30 transition-all">Clear Chat</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((m) => (
          <div key={m.id} className="animate-fadeIn">
            <span className={`text-[10px] font-black mr-2 uppercase tracking-widest ${m.role === 'user' ? 'text-blue-400' : 'text-gray-500'}`}>
              {m.senderName}:
            </span>
            <div className={`inline-block p-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 shadow-lg' : 'bg-white/5 border border-white/10'}`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse ml-2">Seseorang sedang mengetik...</div>}
      </div>

      <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-md">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-blue-600 px-8 rounded-full text-xs font-black uppercase hover:bg-blue-500 transition-all shadow-lg active:scale-95">
            KIRIM
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
