import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Palette, Layers, Maximize, Sliders, Crown, X, Check, Monitor, Minimize, ChevronDown, ChevronUp, Box, Move, Type, Smartphone, LayoutTemplate, Aperture, Sticker, Wand2, Sun, EyeOff, AlignStartVertical, AlignEndVertical, AlignStartHorizontal, AlignEndHorizontal, Globe } from 'lucide-react';

export default function SnapPolishApp() {
  const [settings, setSettings] = useState({
    padding: 60,
    shadow: 3, 
    borderRadius: 16,
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    bgType: 'gradient', 
    pattern: 'none', 
    customBackground: null,
    mockup: 'browser',
    browserText: 'snappolish.com', 
    darkMode: true,
    scale: 100,
    rotate: 0,
    tilt: 0,
    brightness: 100,
    contrast: 100,
    blur: 0,
    grayscale: 0,
    showWatermark: true,
    watermarkText: 'SnapPolish',
    watermarkLogo: null,
    badgeText: '',
    badgeColor: '#ef4444',
    badgeTextColor: '#ffffff',
    badgeRotation: 0,
    badgePosition: 'top-right',
    aspectRatio: 'auto',
  });

  const [image, setImage] = useState("https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80");
  const [activeTab, setActiveTab] = useState('layout'); 
  const [showProModal, setShowProModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const exportRef = useRef(null);

  // İndirme aracını yükle (Kurulumsuz çalışması için)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const applyPreset = (type) => {
    switch(type) {
      case 'minimal':
        setSettings(prev => ({...prev, padding: 60, shadow: 1, borderRadius: 8, background: '#f1f5f9', bgType: 'solid', mockup: 'none', rotate: 0, tilt: 0}));
        break;
      case 'social':
        setSettings(prev => ({...prev, padding: 60, shadow: 4, borderRadius: 24, aspectRatio: '4/5', mockup: 'phone', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', bgType: 'gradient', rotate: -2, tilt: 0}));
        break;
      case 'pro':
        setSettings(prev => ({...prev, padding: 80, shadow: 5, borderRadius: 12, mockup: 'browser', darkMode: true, background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', bgType: 'gradient', rotate: 0, tilt: 5}));
        break;
    }
  };

  const handleUpload = (e, targetState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (targetState === 'main') setImage(e.target.result);
        if (targetState === 'bg') setSettings(s => ({ ...s, customBackground: e.target.result, bgType: 'image' }));
        if (targetState === 'logo') setSettings(s => ({ ...s, watermarkLogo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getShadowClass = (level) => {
    const shadows = ['shadow-none', 'shadow-sm', 'shadow-md', 'shadow-xl', 'shadow-2xl', 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]'];
    return shadows[level] || shadows[3];
  };

  const getBackgroundStyle = () => {
    if (settings.bgType === 'image' && settings.customBackground) {
      return { background: `url(${settings.customBackground}) center/cover` };
    }
    let baseBg = settings.background;
    if (settings.pattern === 'dots') {
      return { 
        backgroundColor: settings.background.includes('gradient') ? '#f8fafc' : settings.background,
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      };
    }
    if (settings.pattern === 'grid') {
      return { 
        backgroundColor: settings.background.includes('gradient') ? '#f8fafc' : settings.background,
        backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      };
    }
    return { background: baseBg };
  };

  const getBadgeStyle = () => {
    const style = {
      backgroundColor: settings.badgeColor,
      color: settings.badgeTextColor,
      transform: `rotate(${settings.badgeRotation}deg)`,
    };
    switch (settings.badgePosition) {
      case 'top-left': return { ...style, top: '1rem', left: '1rem' };
      case 'top-right': return { ...style, top: '1rem', right: '1rem' };
      case 'bottom-left': return { ...style, bottom: '1rem', left: '1rem' };
      case 'bottom-right': return { ...style, bottom: '1rem', right: '1rem' };
      default: return { ...style, top: '1rem', right: '1rem' };
    }
  };

  // İNDİRME FONKSİYONU - 4K Kalite Ayarlı
  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsDownloading(true);
    
    try {
      if (typeof window.html2canvas === 'undefined') {
        alert('İndirme aracı hazırlanıyor, lütfen 3 saniye sonra tekrar deneyin.');
        setIsDownloading(false);
        return;
      }

      // Fontların ve görsellerin tam yüklenmesi için bekleme
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await window.html2canvas(exportRef.current, {
        scale: 4, // 4x Ölçekleme (4K Kalite)
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: exportRef.current.offsetWidth,
        height: exportRef.current.offsetHeight
      });

      const link = document.createElement('a');
      link.download = 'snappolish-4k.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error("İndirme hatası:", error);
      alert("Hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.error);
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans flex flex-col-reverse md:flex-row overflow-hidden">
      
      {/* --- KONTROL PANELİ --- */}
      <div className={`bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex flex-col z-30 shadow-2xl transition-all duration-300 ease-in-out ${showSidebar ? 'h-[55vh] md:h-screen w-full md:w-80' : 'h-12 md:h-screen w-full md:w-0 overflow-hidden opacity-0'}`}>
        
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 min-w-[320px]">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 rounded-lg text-white"><ImageIcon size={18} /></div>
            <h1 className="font-bold text-base md:text-lg">SnapPolish <span className="text-xs font-normal text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded ml-1">v3.1 (Ultra HD)</span></h1>
          </div>
          <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-slate-400"><ChevronDown size={20}/></button>
        </div>

        <div className="flex border-b border-slate-800 min-w-[320px]">
          {['layout', 'style', 'branding'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar min-w-[320px]">
          {activeTab === 'layout' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <section className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Aperture size={14} /> Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => applyPreset('minimal')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs hover:bg-slate-700 transition">Minimal</button>
                  <button onClick={() => applyPreset('social')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs hover:bg-slate-700 transition">Social</button>
                  <button onClick={() => applyPreset('pro')} className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-500 rounded-lg text-xs hover:bg-amber-500/30 transition">Pro</button>
                </div>
              </section>
              <section className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Smartphone size={14} /> Frame Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['browser', 'phone', 'none'].map(m => (
                    <button key={m} onClick={() => setSettings({...settings, mockup: m})} className={`p-2 rounded-lg text-xs border capitalize ${settings.mockup === m ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{m}</button>
                  ))}
                </div>
                {settings.mockup === 'browser' && (
                  <div className="mt-3 bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                    <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1"><Globe size={10} /> Browser URL</label>
                    <input type="text" value={settings.browserText} onChange={(e) => setSettings({...settings, browserText: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors" placeholder="yoursite.com"/>
                  </div>
                )}
              </section>
              <section className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><LayoutTemplate size={14} /> Size & Padding</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['auto', '1/1', '16/9', '4/5', '9/16'].map(r => (
                      <button key={r} onClick={() => setSettings({...settings, aspectRatio: r})} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap border ${settings.aspectRatio === r ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{r === 'auto' ? 'Auto' : r}</button>
                    ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400"><span>Padding</span><span>{settings.padding}px</span></div>
                  <input type="range" min="0" max="200" value={settings.padding} onChange={(e) => setSettings({...settings, padding: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400"><span>Scale</span><span>{settings.scale}%</span></div>
                  <input type="range" min="50" max="150" value={settings.scale} onChange={(e) => setSettings({...settings, scale: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
                </div>
              </section>
              <section className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Move size={14} /> 3D Transform</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Rotate</span>
                    <input type="range" min="-15" max="15" value={settings.rotate} onChange={(e) => setSettings({...settings, rotate: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Tilt</span>
                    <input type="range" min="-20" max="20" value={settings.tilt} onChange={(e) => setSettings({...settings, tilt: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Palette size={14} /> Background</label>
                  <button onClick={() => bgInputRef.current?.click()} className="text-[10px] text-cyan-400 hover:text-cyan-300">+ Image</button>
                  <input type="file" ref={bgInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'bg')} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)', 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', '#1e293b'].map((bg, i) => (
                    <button key={i} onClick={() => setSettings({...settings, background: bg, bgType: 'gradient', pattern: 'none'})} className="h-8 rounded-md border border-slate-600 hover:scale-105 transition" style={{ background: bg }} />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                   <button onClick={() => setSettings({...settings, pattern: 'dots', background: '#f8fafc', bgType: 'pattern'})} className="flex-1 text-[10px] py-1 border border-slate-700 rounded bg-slate-800 text-slate-400 hover:text-white">Dots</button>
                   <button onClick={() => setSettings({...settings, pattern: 'grid', background: '#f8fafc', bgType: 'pattern'})} className="flex-1 text-[10px] py-1 border border-slate-700 rounded bg-slate-800 text-slate-400 hover:text-white">Grid</button>
                   <button onClick={() => setSettings({...settings, pattern: 'none'})} className="flex-1 text-[10px] py-1 border border-slate-700 rounded bg-slate-800 text-slate-400 hover:text-white">Solid</button>
                </div>
              </section>
              <section className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Wand2 size={14} /> Image Tuning</label>
                <div className="space-y-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Brightness</span><span>{settings.brightness}%</span></div>
                    <input type="range" min="50" max="150" value={settings.brightness} onChange={(e) => setSettings({...settings, brightness: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg accent-amber-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Contrast</span><span>{settings.contrast}%</span></div>
                    <input type="range" min="50" max="150" value={settings.contrast} onChange={(e) => setSettings({...settings, contrast: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg accent-amber-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Blur (Privacy)</span><span>{settings.blur}px</span></div>
                    <input type="range" min="0" max="10" value={settings.blur} onChange={(e) => setSettings({...settings, blur: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg accent-amber-400" />
                  </div>
                </div>
              </section>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setSettings(s => ({...s, darkMode: !s.darkMode}))} className={`p-2 rounded border text-xs flex items-center justify-center gap-2 ${settings.darkMode ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}><Monitor size={14}/> Dark Mode</button>
                 <button onClick={() => setSettings(s => ({...s, windowControls: !s.windowControls}))} className={`p-2 rounded border text-xs flex items-center justify-center gap-2 ${settings.windowControls ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}><Box size={14}/> Controls</button>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <section className="space-y-3">
                 <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Sticker size={14} /> Watermark</label>
                   <input type="checkbox" checked={settings.showWatermark} onChange={() => setSettings(s => ({...s, showWatermark: !s.showWatermark}))} className="accent-cyan-500" />
                 </div>
                 {settings.showWatermark && (
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-3">
                     <input type="text" value={settings.watermarkText} onChange={(e) => setSettings({...settings, watermarkText: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 outline-none" placeholder="Brand Name" />
                     <div className="flex items-center gap-2">
                       <button onClick={() => logoInputRef.current?.click()} className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-1.5 rounded text-slate-300">Upload Logo</button>
                       <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />
                     </div>
                   </div>
                 )}
              </section>
              <section className="space-y-3">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Type size={14} /> Promo Badge <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1 rounded ml-1">NEW</span></label>
                 <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-3">
                    <input type="text" value={settings.badgeText} onChange={(e) => setSettings({...settings, badgeText: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 outline-none" placeholder="e.g. NEW FEATURE" />
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400">Position</label>
                      <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg">
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                          <button key={pos} onClick={() => setSettings({...settings, badgePosition: pos})} className={`p-1 rounded ${settings.badgePosition === pos ? 'bg-slate-700 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            {pos === 'top-left' && <AlignStartVertical size={14} className="rotate-180" />}
                            {pos === 'top-right' && <AlignEndVertical size={14} className="rotate-180" />}
                            {pos === 'bottom-left' && <AlignStartVertical size={14} />}
                            {pos === 'bottom-right' && <AlignEndVertical size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Rotation</span><span>{settings.badgeRotation}°</span></div>
                      <input type="range" min="-45" max="45" value={settings.badgeRotation} onChange={(e) => setSettings({...settings, badgeRotation: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg accent-amber-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-slate-400">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={settings.badgeColor} onChange={(e) => setSettings({...settings, badgeColor: e.target.value})} className="w-6 h-6 rounded-full border border-slate-600 bg-transparent cursor-pointer" />
                          <div className="flex gap-1">
                            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
                              <button key={c} onClick={() => setSettings({...settings, badgeColor: c})} className={`w-4 h-4 rounded-full border ${settings.badgeColor === c ? 'border-white' : 'border-transparent'}`} style={{background: c}} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-slate-400">Text Color</label>
                        <div className="flex items-center gap-2">
                           <input type="color" value={settings.badgeTextColor} onChange={(e) => setSettings({...settings, badgeTextColor: e.target.value})} className="w-6 h-6 rounded-full border border-slate-600 bg-transparent cursor-pointer" />
                           <div className="flex gap-1">
                            {['#ffffff', '#000000', '#1e293b'].map(c => (
                              <button key={c} onClick={() => setSettings({...settings, badgeTextColor: c})} className={`w-4 h-4 rounded-full border ${settings.badgeTextColor === c ? 'border-white' : 'border-slate-700'}`} style={{background: c}} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
              </section>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 min-w-[320px] flex gap-2">
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'main')} />
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 text-sm font-medium flex items-center justify-center gap-2">
            <Upload size={16} /> <span className="hidden md:inline">Upload</span>
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {isDownloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download size={16} />}
            Download 4K
          </button>
        </div>
      </div>

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 md:p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* Canvas */}
        <div 
          ref={exportRef}
          className="relative transition-all duration-300 ease-out shadow-2xl flex items-center justify-center overflow-hidden"
          style={{ 
            ...getBackgroundStyle(),
            padding: `${settings.padding}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: settings.aspectRatio === 'auto' ? 'auto' : settings.aspectRatio,
            perspective: '1000px',
          }}
        >
          {/* Main Content */}
          <div 
            className={`relative transition-all duration-300 ${getShadowClass(settings.shadow)} ${settings.mockup === 'phone' ? 'rounded-[2.5rem] border-[8px] border-slate-900' : 'rounded-lg'}`}
            style={{ 
              borderRadius: settings.mockup === 'phone' ? '2.5rem' : `${settings.borderRadius}px`,
              transform: `scale(${settings.scale / 100}) rotate(${settings.rotate}deg) rotateX(${settings.tilt}deg) rotateY(${settings.tilt / 2}deg)`,
              transformStyle: 'preserve-3d',
              backgroundColor: settings.mockup === 'none' ? 'transparent' : (settings.darkMode ? '#0f172a' : '#ffffff'),
              overflow: 'hidden'
            }}
          >
            {settings.mockup === 'browser' && (
              <div className={`h-6 md:h-8 px-3 flex items-center gap-2 border-b ${settings.darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div></div>
                <div className={`ml-2 flex-1 h-4 rounded flex items-center px-2 opacity-40 text-[8px] md:text-[10px] ${settings.darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {settings.browserText}
                </div>
              </div>
            )}
            {settings.mockup === 'phone' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-slate-900 rounded-b-xl z-20"></div>}

            {settings.badgeText && (
              <div className="absolute z-30 px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all" style={getBadgeStyle()}>
                {settings.badgeText}
              </div>
            )}

            <img 
              src={image} 
              alt="Preview" 
              className="max-w-full object-contain block" 
              style={{
                maxHeight: settings.aspectRatio !== 'auto' ? '100%' : '60vh',
                minWidth: settings.mockup === 'phone' ? '280px' : 'auto',
                filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) blur(${settings.blur}px) grayscale(${settings.grayscale}%)`
              }}
              crossOrigin="anonymous" 
            />

            {settings.showWatermark && (
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {settings.watermarkLogo ? <img src={settings.watermarkLogo} alt="Logo" className="w-4 h-4 rounded-full object-cover" /> : <Monitor size={12} className="text-white" />}
                <span className="text-[10px] md:text-xs font-bold text-white shadow-sm">{settings.watermarkText}</span>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-6 gap-2 bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-xl z-30">
           <button onClick={() => setShowSidebar(!showSidebar)} className={`p-2 text-slate-400 hover:text-white rounded-lg transition ${!showSidebar && 'text-cyan-400 bg-slate-700'}`}><Sliders size={18} /></button>
           <div className="w-px bg-slate-700 my-1"></div>
           <button onClick={() => document.documentElement.requestFullscreen().catch(console.error)} className="p-2 text-slate-400 hover:text-white rounded-lg transition"><Maximize size={18} /></button>
        </div>
      </div>
    </div>
  );
}