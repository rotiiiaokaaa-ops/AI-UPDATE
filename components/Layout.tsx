
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const tabs = [
    { id: AppTab.SOPAN_CHAT, label: 'Chat Sopan', icon: '😊' },
    { id: AppTab.GALAK_CHAT, label: 'Chat Galak', icon: '🤬' },
    { id: AppTab.GROUP_CHAT, label: 'Grup Chat', icon: '🌐' },
    { id: AppTab.WEB_BUILDER, label: 'Web Builder', icon: '💻' },
    { id: AppTab.CREATIVE_STUDIO, label: 'Creative Studio', icon: '🎬' },
    { id: AppTab.MEDIA_POWER, label: 'Media Power', icon: '⚡' },
    { id: AppTab.HOSTING_GUIDE, label: 'Hosting GitHub', icon: '🚀' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505]">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-[#0d0d0d] border-r border-white/10 flex flex-col items-center py-6 transition-all duration-300">
        <h1 className="text-xl font-bold mb-8 hidden md:block text-blue-500 italic tracking-tighter">RahmanAi</h1>
        <div className="text-2xl mb-8 md:hidden">R</div>
        
        <nav className="flex-1 w-full space-y-2 px-3 overflow-y-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden md:block font-bold text-xs uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-white/5 w-full text-center">
          <p className="text-[10px] text-gray-500 hidden md:block font-black uppercase tracking-tighter">hijrah abdur rahman</p>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
