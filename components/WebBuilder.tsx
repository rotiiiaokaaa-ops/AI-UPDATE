
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateWebCode } from '../services/geminiService';
import { Persona, WebProject } from '../types';

interface WebBuilderProps {
  currentPersona: Persona;
}

const STORAGE_KEY = 'rahman_web_projects_v2';

const WebBuilder: React.FC<WebBuilderProps> = ({ currentPersona }) => {
  // Projects State
  const [projects, setProjects] = useState<WebProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Current Project Workspace States
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [code, setCode] = useState({ html: '', css: '', js: '' });
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, content: string}[]>([]);
  
  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeFile, setActiveFile] = useState<'html' | 'css' | 'js'>('html');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProjectSidebar, setShowProjectSidebar] = useState(true);

  // Initialize: Load Projects
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: WebProject[] = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          loadProject(parsed[0].id, parsed);
        } else {
          createNewProject();
        }
      } catch (e) {
        console.error("Gagal memuat proyek", e);
        createNewProject();
      }
    } else {
      createNewProject();
    }
  }, []);

  // Create New Project
  const createNewProject = () => {
    const newProj: WebProject = {
      id: Date.now().toString(),
      name: 'Website Baru ' + (projects.length + 1),
      lastUpdated: Date.now(),
      history: [],
      html: '',
      css: '',
      js: '',
      images: [],
      uploadedFiles: []
    };
    const updatedProjects = [newProj, ...projects];
    setProjects(updatedProjects);
    setActiveProjectId(newProj.id);
    
    // Clear workspace
    setPrompt('');
    setHistory([]);
    setCode({ html: '', css: '', js: '' });
    setReferenceImages([]);
    setUploadedFiles([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  };

  // Load Specific Project
  const loadProject = (id: string, allProjects?: WebProject[]) => {
    const targetProjects = allProjects || projects;
    const project = targetProjects.find(p => p.id === id);
    if (project) {
      setActiveProjectId(project.id);
      setHistory(project.history);
      setCode({ html: project.html, css: project.css, js: project.js });
      setReferenceImages(project.images);
      setUploadedFiles(project.uploadedFiles);
      setPrompt('');
      setViewMode('preview');
    }
  };

  // Auto Save Logic (Sync Workspace to Project List)
  useEffect(() => {
    if (!activeProjectId) return;
    
    const timeout = setTimeout(() => {
      setProjects(prev => {
        const updated = prev.map(p => {
          if (p.id === activeProjectId) {
            return {
              ...p,
              history,
              html: code.html,
              css: code.css,
              js: code.js,
              images: referenceImages,
              uploadedFiles,
              lastUpdated: Date.now(),
              // Update name if it's still default and history has items
              name: (p.name.startsWith('Website Baru') && history.length > 0) 
                ? history[0].substring(0, 30) + '...' 
                : p.name
            };
          }
          return p;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [code, history, referenceImages, uploadedFiles, activeProjectId]);

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = currentPersona === 'galak' 
      ? "Beneran mau hapus? Gak bisa balik lagi loh!" 
      : "Hapus proyek ini secara permanen?";
    if (!window.confirm(confirmMsg)) return;

    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    if (activeProjectId === id) {
      if (updated.length > 0) {
        loadProject(updated[0].id, updated);
      } else {
        createNewProject();
      }
    }
  };

  const handleBuild = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt && referenceImages.length === 0 && uploadedFiles.length === 0) return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    const newPrompt = cleanPrompt || "Update based on context.";
    
    try {
      const result = await generateWebCode(newPrompt, currentPersona, referenceImages, code.html ? code : undefined, uploadedFiles);
      setCode(result);
      setHistory(prev => [...prev, newPrompt]);
      setPrompt('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message?.includes('429') ? "BATAS KUOTA HABIS! Tunggu 1 menit." : "Terjadi kesalahan sistem.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'webp'].includes(extension || '')) {
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) setReferenceImages(prev => [...prev, ev.target!.result as string]); };
        reader.readAsDataURL(file);
      } else if (['html', 'css', 'js', 'txt'].includes(extension || '')) {
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) setUploadedFiles(prev => [...prev, { name: file.name, content: ev.target!.result as string }]); };
        reader.readAsText(file);
      }
    });
  };

  const hasContent = useMemo(() => code.html.trim().length > 0, [code]);

  const processedCode = useMemo(() => {
    if (!hasContent) return '';
    let finalHtml = code.html;
    let finalCss = code.css;
    referenceImages.forEach((img, index) => {
      const placeholder = `IMAGE_${index}`;
      finalHtml = finalHtml.split(placeholder).join(img);
      finalCss = finalCss.split(placeholder).join(img);
    });
    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Builder</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        ${finalCss}
    </style>
</head>
<body>
    ${finalHtml}
    <script>${code.js}</script>
</body>
</html>`;
  }, [code, referenceImages, hasContent]);

  const handleSaveHtml = () => {
    if (!hasContent) return;
    const blob = new Blob([processedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0a0a0a]">
      {showFullPreview && (
        <div className="fixed inset-0 z-[200] bg-black animate-fadeIn flex flex-col">
          <div className="h-16 bg-black/90 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-xl">
            <h4 className="text-xs font-black tracking-[0.3em] uppercase text-white/70 italic">FULL PREVIEW</h4>
            <div className="flex gap-3">
              <button onClick={handleSaveHtml} className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">DOWNLOAD</button>
              <button onClick={() => setShowFullPreview(false)} className="px-6 py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full">CLOSE</button>
            </div>
          </div>
          <iframe srcDoc={processedCode} className="flex-1 bg-white" title="Full Preview" />
        </div>
      )}

      {/* Project Sidebar */}
      {showProjectSidebar && (
        <div className="w-64 border-r border-white/10 bg-black/60 flex flex-col animate-slideInLeft overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">PROYEK SAYA</h3>
            <button 
              onClick={createNewProject}
              className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              + PROYEK BARU
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {projects.map(p => (
              <div 
                key={p.id}
                onClick={() => loadProject(p.id)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${
                  activeProjectId === p.id 
                  ? 'bg-blue-600/10 border-blue-500/40 text-blue-100 shadow-xl' 
                  : 'bg-white/5 border-transparent hover:border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                <p className="text-[11px] font-bold truncate pr-4">{p.name}</p>
                <p className="text-[8px] opacity-40 mt-1 uppercase tracking-tighter">Diupdate: {new Date(p.lastUpdated).toLocaleDateString()}</p>
                <button 
                  onClick={(e) => deleteProject(p.id, e)}
                  className="absolute top-4 right-4 text-[10px] opacity-0 group-hover:opacity-100 text-red-500 hover:scale-125 transition-all"
                >✕</button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowProjectSidebar(false)}
            className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-white"
          >
            ← SEMBUNYIKAN
          </button>
        </div>
      )}

      {!showProjectSidebar && (
        <button 
          onClick={() => setShowProjectSidebar(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-blue-600/20 hover:bg-blue-600/40 p-2 rounded-r-xl border border-blue-500/20 text-blue-400 transition-all"
        >
          →
        </button>
      )}

      {/* Workspace Panel */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Left: Input Panel */}
        <div className="w-full md:w-[400px] border-r border-white/10 flex flex-col p-5 bg-black/40 backdrop-blur-md relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-black text-xl tracking-tighter italic ${currentPersona === 'galak' ? 'text-red-500' : 'text-blue-500'}`}>
              WORKSPACE
            </h3>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">AUTO SAVED ✅</span>
          </div>
          
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-600/20 border border-red-500/40 rounded-2xl text-[10px] font-black text-red-400 uppercase text-center animate-bounce">
              ⚠️ {errorMessage}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                <span className="text-4xl mb-4">🚀</span>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black leading-relaxed">
                  MULAI BUILD WEBSITE<br/>ATAU UPLOAD FILE
                </p>
              </div>
            ) : (
              history.map((h, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl text-[11px] text-gray-400 border border-white/10">
                  <span className="text-blue-500 font-bold mr-2">PROMPT:</span> {h}
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 p-4 bg-white/5 rounded-3xl border border-white/10 relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {referenceImages.map((img, i) => (
                <div key={`img-${i}`} className="relative shrink-0 w-16 h-16">
                  <img src={img} className="w-full h-full object-cover rounded-xl border border-white/20" />
                  <button onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 text-[8px] text-white">✕</button>
                </div>
              ))}
              {uploadedFiles.map((file, i) => (
                <div key={`file-${i}`} className="relative shrink-0 w-16 h-16 bg-gray-900 rounded-xl border border-white/10 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-lg">📄</span>
                  <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 text-[8px] text-white">✕</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 items-start relative">
              <label className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer border border-white/10 shrink-0">
                📂 <input type="file" multiple className="hidden" accept="image/*,.html,.css,.js,.txt" onChange={handleFileUpload} />
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Deskripsikan perubahan..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none resize-none"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleBuild())}
              />
            </div>
            
            <button
              onClick={handleBuild}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] transition-all ${isGenerating ? 'bg-gray-800 animate-pulse' : 'bg-blue-600 shadow-xl shadow-blue-900/20'}`}
            >
              {isGenerating ? 'PROCESSING...' : 'GENERATE / UPDATE'}
            </button>
          </div>
        </div>

        {/* Right: Output Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl shrink-0">
            <div className="flex gap-8">
              <button onClick={() => setViewMode('preview')} className={`text-[11px] font-black tracking-widest uppercase relative py-2 ${viewMode === 'preview' ? 'text-blue-400' : 'text-gray-500'}`}>
                PREVIEW {viewMode === 'preview' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>}
              </button>
              <button onClick={() => setViewMode('code')} className={`text-[11px] font-black tracking-widest uppercase relative py-2 ${viewMode === 'code' ? 'text-blue-400' : 'text-gray-500'}`}>
                CODE {viewMode === 'code' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-full"></span>}
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowFullPreview(true)} disabled={!hasContent} className="px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-gray-300 disabled:opacity-30">FULLSCREEN</button>
              <button onClick={handleSaveHtml} disabled={!hasContent} className="px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-600 shadow-lg disabled:opacity-30">SAVE HTML</button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#0a0a0a] flex flex-col items-center">
            {viewMode === 'preview' ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
                  <div className={`transition-all duration-500 ease-in-out bg-white shadow-2xl relative overflow-hidden w-full h-full rounded-2xl`}>
                    {hasContent ? (
                      <iframe srcDoc={processedCode} className="w-full h-full animate-fadeIn" title="Preview" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8f9fa] text-gray-400 select-none">
                        <div className="text-6xl mb-4">💻</div>
                        <p className="font-black text-[10px] uppercase tracking-[0.4em] text-center">Website akan muncul di sini.</p>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <div className="flex flex-col items-center animate-pulse">
                          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">RENDERING...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full h-full bg-[#0d0d0d]">
                <div className="flex bg-[#1a1a1a] border-b border-white/5 shrink-0">
                  {['html', 'css', 'js'].map((f) => (
                    <button key={f} onClick={() => setActiveFile(f as any)} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeFile === f ? 'bg-[#0d0d0d] text-blue-400 border-t-2 border-blue-400' : 'text-gray-600 hover:text-gray-300'}`}>index.{f}</button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto p-8 mono text-xs text-blue-100/70 leading-relaxed whitespace-pre scrollbar-thin">
                  {code[activeFile] || "// Tunggu AI menghasilkan kode..."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebBuilder;
