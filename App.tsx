
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ChatView from './components/ChatView';
import GroupChat from './components/GroupChat';
import WebBuilder from './components/WebBuilder';
import CreativeStudio from './components/CreativeStudio';
import MediaPower from './components/MediaPower';
import HostingGuide from './components/HostingGuide';
import { AppTab, Persona } from './types';

// Use (window as any).aistudio to access platform-injected global methods
// to avoid modifier mismatch and declaration conflict errors in the global Window interface.

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SOPAN_CHAT);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);

  // Determine current persona based on active tab
  const currentPersona: Persona = activeTab === AppTab.GALAK_CHAT ? 'galak' : 'sopan';

  useEffect(() => {
    const checkKey = async () => {
      try {
        // Access aistudio via type assertion to avoid global declaration conflicts
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
      } catch (e) {
        setIsKeySelected(false);
      }
    };
    checkKey();

    const saved = localStorage.getItem('rahman_active_tab');
    if (saved) setActiveTab(saved as AppTab);
  }, []);

  useEffect(() => {
    localStorage.setItem('rahman_active_tab', activeTab);
  }, [activeTab]);

  const handleSelectKey = async () => {
    // Access aistudio via type assertion to avoid global declaration conflicts
    await (window as any).aistudio.openSelectKey();
    // Proceed immediately as per race condition guidelines
    setIsKeySelected(true);
  };

  // 1. API Key Selection Screen (Mandatory for Paid Models like Veo)
  if (isKeySelected === false) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <h1 className="text-5xl font-black italic tracking-tighter text-white">API KEY REQUIRED</h1>
            <p className="text-gray-400 text-xs leading-relaxed font-medium">
              Untuk mengaktifkan fitur premium (Video AI, Web Builder Pro, & Gambar 4K), Anda harus memilih API Key dari proyek Google Cloud yang valid.
            </p>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-2">Penting:</p>
              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                Pastikan kunci berasal dari proyek dengan penagihan aktif (Paid Project).
                Lihat <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-blue-500 hover:text-blue-400">Dokumentasi Penagihan</a>.
              </p>
            </div>
          </div>
          <button 
            onClick={handleSelectKey}
            className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-2xl active:scale-95"
          >
            AKTIFKAN SISTEM
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isKeySelected === null) {
    return <div className="fixed inset-0 bg-black flex items-center justify-center text-white font-black text-xs tracking-widest uppercase animate-pulse">Initializing Security...</div>;
  }

  // 3. Welcome Screen
  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md space-y-8 animate-fadeIn">
          <div className="space-y-2">
            <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-700">RahmanAi</h1>
            <p className="text-gray-400 text-[10px] tracking-[0.5em] font-black uppercase">ULTRA CREATIVE SYSTEM</p>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Sistem AI All-in-One tanpa batas. Bangun Web, buat Foto & Video AI, serta Chat dengan AI paling cerdas menggunakan API Key pilihan Anda.
            </p>
          </div>
          <button 
            onClick={() => setShowWelcome(false)}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-blue-400 hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95"
          >
            AKTIFKAN SISTEM
          </button>
          <button 
            onClick={handleSelectKey}
            className="text-[10px] text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest"
          >
            Ganti API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className={`h-full ${activeTab === AppTab.SOPAN_CHAT ? 'block' : 'hidden'}`}>
        <ChatView persona="sopan" />
      </div>
      <div className={`h-full ${activeTab === AppTab.GALAK_CHAT ? 'block' : 'hidden'}`}>
        <ChatView persona="galak" />
      </div>
      <div className={`h-full ${activeTab === AppTab.GROUP_CHAT ? 'block' : 'hidden'}`}>
        <GroupChat />
      </div>
      <div className={`h-full ${activeTab === AppTab.WEB_BUILDER ? 'block' : 'hidden'}`}>
        <WebBuilder currentPersona={currentPersona} />
      </div>
      <div className={`h-full ${activeTab === AppTab.CREATIVE_STUDIO ? 'block' : 'hidden'}`}>
        <CreativeStudio />
      </div>
      <div className={`h-full ${activeTab === AppTab.MEDIA_POWER ? 'block' : 'hidden'}`}>
        <MediaPower />
      </div>
      <div className={`h-full ${activeTab === AppTab.HOSTING_GUIDE ? 'block' : 'hidden'}`}>
        <HostingGuide currentPersona={currentPersona} />
      </div>
    </Layout>
  );
};

export default App;
