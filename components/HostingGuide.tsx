
import React, { useState, useEffect } from 'react';
import { generateHostingGuide } from '../services/geminiService';
import { Persona } from '../types';

interface HostingGuideProps {
  currentPersona: Persona;
}

const HostingGuide: React.FC<HostingGuideProps> = ({ currentPersona }) => {
  const [guide, setGuide] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchGuide = async () => {
    setLoading(true);
    try {
      const result = await generateHostingGuide(currentPersona);
      setGuide(result || 'Gagal memuat panduan.');
    } catch (err) {
      setGuide('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuide();
  }, [currentPersona]);

  return (
    <div className={`flex flex-col h-full p-6 md:p-12 overflow-hidden ${currentPersona === 'galak' ? 'bg-[#0f0000]' : 'bg-[#00050f]'}`}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className={`text-4xl font-black mb-2 tracking-tighter italic ${currentPersona === 'galak' ? 'text-red-500' : 'text-blue-500'}`}>
            {currentPersona === 'galak' ? 'CARA HOSTING (BUAT LU YANG GAPTEK)' : 'PANDUAN HOSTING GITHUB'}
          </h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Deploy website impianmu ke dunia nyata secara gratis.</p>
        </div>
        <button 
          onClick={fetchGuide}
          disabled={loading}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-xl ${
            currentPersona === 'galak' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
          } ${loading ? 'animate-pulse opacity-50' : ''}`}
        >
          {loading ? 'REGENERATING...' : 'REFRESH PANDUAN'}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto rounded-[2rem] border p-8 md:p-12 backdrop-blur-xl shadow-2xl scrollbar-thin transition-all ${
          currentPersona === 'galak' 
          ? 'bg-red-950/20 border-red-900/30' 
          : 'bg-blue-950/20 border-blue-900/30'
        }`}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
              <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${currentPersona === 'galak' ? 'border-red-500' : 'border-blue-500'}`}></div>
              <p className="text-xs font-black uppercase tracking-[0.3em]">Menyusun Instruksi Strategis...</p>
            </div>
          ) : (
            <div className={`prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-sm md:text-base animate-fadeIn ${
              currentPersona === 'galak' ? 'text-red-100' : 'text-blue-50'
            }`}>
              {guide}
            </div>
          )}
        </div>

        {/* Sidebar Checklist */}
        <div className="hidden lg:flex w-72 flex-col gap-4">
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">CHECKLIST PERSIAPAN</h4>
            <div className="space-y-4">
              {[
                { label: 'Download index.html', done: true },
                { label: 'Punya Akun GitHub', done: false },
                { label: 'Buat Repositori', done: false },
                { label: 'Upload File', done: false },
                { label: 'Aktifkan Pages', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${step.done ? 'bg-green-500 border-green-500 text-white' : 'border-white/20'}`}>
                    {step.done && '✓'}
                  </div>
                  <span className={`text-[11px] font-medium ${step.done ? 'text-gray-300' : 'text-gray-500'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`p-6 rounded-[2rem] border shadow-2xl ${currentPersona === 'galak' ? 'bg-red-600/10 border-red-500/20' : 'bg-blue-600/10 border-blue-500/20'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">💡 Tips Cepat</p>
            <p className="text-[11px] text-gray-400 leading-relaxed italic">
              {currentPersona === 'galak' 
                ? "Pastikan filenya namanya 'index.html', jangan aneh-aneh namanya atau gak bakal jalan!" 
                : "Nama file harus 'index.html' agar GitHub Pages mengenalinya sebagai halaman utama."}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Icons */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all group">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📁</div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">BUAT REPO BARU</p>
            <p className="text-[8px] text-gray-500 font-bold uppercase">KLIK UNTUK KE GITHUB</p>
          </div>
        </a>
        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-2xl">🐙</div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">DRAG & DROP FILE</p>
            <p className="text-[8px] text-gray-500 font-bold uppercase">UPLOAD INDEX.HTML LU!</p>
          </div>
        </div>
        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-2xl">🌍</div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">ACTIVE PAGES</p>
            <p className="text-[8px] text-gray-500 font-bold uppercase">DI TAB SETTINGS REPO</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostingGuide;
