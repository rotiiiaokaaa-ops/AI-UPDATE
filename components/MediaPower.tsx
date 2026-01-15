
import React, { useState } from 'react';

const MediaPower: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [files, setFiles] = useState<{name: string, type: string, url: string}[]>([]);

  const handleProcess = (type: 'mp3' | 'subtitle') => {
    setStatus(`Sedang memproses ${type === 'mp3' ? 'Konversi ke MP3' : 'Generate Subtitle'}...`);
    setTimeout(() => {
      setStatus(`Berhasil! Silahkan cek daftar di bawah.`);
      const name = type === 'mp3' ? 'hasil_audio.mp3' : 'video_ber_subtitle.mp4';
      setFiles(prev => [{name, type, url: '#'}, ...prev]);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-[#0a0a0a]">
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2 tracking-tighter italic">MEDIA POWER ⚡</h2>
        <p className="text-gray-500 text-sm">Convert, Subtitle, & Edit tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-3xl mb-4">🎵</div>
          <h4 className="font-bold mb-2">MP4 TO MP3</h4>
          <p className="text-xs text-gray-500 mb-6">Ubah video jadi suara dalam sekejap.</p>
          <input type="file" accept="video/*" className="hidden" id="mp3-up" onChange={() => handleProcess('mp3')} />
          <label htmlFor="mp3-up" className="w-full py-3 bg-blue-600 rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-700 transition-colors">UPLOAD VIDEO</label>
        </div>

        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-3xl mb-4">📝</div>
          <h4 className="font-bold mb-2">AUTO SUBTITLE</h4>
          <p className="text-xs text-gray-500 mb-6">Generate subtitle otomatis buat video kamu.</p>
          <input type="file" accept="video/*" className="hidden" id="sub-up" onChange={() => handleProcess('subtitle')} />
          <label htmlFor="sub-up" className="w-full py-3 bg-purple-600 rounded-xl font-bold text-xs cursor-pointer hover:bg-purple-700 transition-colors">UPLOAD VIDEO</label>
        </div>
      </div>

      {status && (
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center text-blue-400 text-sm animate-pulse">
          {status}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">RIWAYAT PROSES</h3>
        <div className="space-y-3">
          {files.length === 0 ? (
            <div className="p-12 text-center text-gray-600 italic">Belum ada file yang di proses.</div>
          ) : (
            files.map((f, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{f.type === 'mp3' ? '🎧' : '🎬'}</span>
                  <div>
                    <p className="font-bold text-sm">{f.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{f.type}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg">DOWNLOAD</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPower;
