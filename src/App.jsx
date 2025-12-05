import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Palette, Layers, Maximize, Sliders, Crown, X, Check, Monitor, Minimize, ChevronDown, ChevronUp, Box, Move, Type, Smartphone, LayoutTemplate, Aperture, Sticker } from 'lucide-react';

export default function SnapPolishApp() {
  // State: Tüm Ayarlar
  const [settings, setSettings] = useState({
    padding: 40,
    shadow: 3, 
    borderRadius: 16,
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    customBackground: null, // Özel arka plan resmi
    mockup: 'browser', // 'browser', 'phone', 'none'
    darkMode: true,
    scale: 100,
    rotate: 0,
    tilt: 0,
    showWatermark: true,
    watermarkText: 'SnapPolish',
    watermarkLogo: null, // Filigran logosu
    aspectRatio: 'auto', // 'auto', '1/1', '16/9', '4/5', '9/16'
  });

  const [image, setImage] = useState("https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
  const [showProModal, setShowProModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const exportRef = useRef(null);

  // html2canvas yükle
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Tam ekran dinleyici
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Hazır Şablonlar (Presets)
  const applyPreset = (type) => {
    switch(type) {
      case 'minimal':
        setSettings(prev => ({...prev, padding: 60, shadow: 1, borderRadius: 8, background: '#f1f5f9', mockup: 'none', rotate: 0, tilt: 0}));
        break;
      case 'social':
        setSettings(prev => ({...prev, padding: 40, shadow: 4, borderRadius: 24, aspectRatio: '4/5', mockup: 'phone', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', rotate: -2, tilt: 0}));
        break;
      case 'pro':
        setSettings(prev => ({...prev, padding: 50, shadow: 5, borderRadius: 12, mockup: 'browser', darkMode: true, background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', rotate: 0, tilt: 5}));
        break;
    }
  };

  // Resim Yükleme Yardımcısı
  const handleUpload = (e, targetState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (targetState === 'main') setImage(e.target.result);
        if (targetState === 'bg') setSettings(s => ({ ...s, customBackground: e.target.result }));
        if (targetState === 'logo') setSettings(s => ({ ...s, watermarkLogo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getShadowClass = (level) => {
    const shadows = [
      'shadow-none', 'shadow-sm', 'shadow-md', 'shadow-xl', 'shadow-2xl', 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]'
    ];
    return shadows[level] || shadows[3];
  };

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsDownloading(true);
    try {
      if (typeof window.html2canvas === 'undefined') {
        alert('İndirme aracı yükleniyor, lütfen bekleyin...');
        setIsDownloading(false);
        return;
      }
      const canvas = await window.html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      const link = document.createElement('a');
      link.download = 'snappolish-design.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("Hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.error);
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans flex flex-col-reverse md:flex-row overflow-hidden">
      
      {/* --- KONTROL PANELİ --- */}
      <div 
        className={`bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex flex-col z-30 shadow-2xl transition-all duration-300 ease-in-out
          ${showSidebar ? 'h-[50vh] md:h-screen w-full md:w-80 translate-y-0 md:translate-x-0' : 'h-12 md:h-screen w-full md:w-0 overflow-hidden opacity-100 md:opacity-0'}
        `}
      >
        {/* Mobil Tutamaç */}
        <div className="md:hidden w-full flex justify-center py-2 bg-slate-800 cursor-pointer" onClick={toggleSidebar}>
          <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
        </div>

        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 min-w-[320px]">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 rounded-lg text-white"><ImageIcon size={18} /></div>
            <h1 className="font-bold text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">SnapPolish</h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400">
            {showSidebar ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar min-w-[320px]">
          
          {/* 1. Hazır Şablonlar */}
          <section className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Aperture size={14} /> Şablonlar</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => applyPreset('minimal')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs hover:bg-slate-700 transition">Minimal</button>
              <button onClick={() => applyPreset('social')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs hover:bg-slate-700 transition">Social</button>
              <button onClick={() => applyPreset('pro')} className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-500 rounded-lg text-xs hover:bg-amber-500/30 transition">Pro</button>
            </div>
          </section>

          {/* 2. Arka Plan */}
          <section className="space-y-3">
            <div className="flex justify-between">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Palette size={14} /> Arka Plan</label>
               <button onClick={() => bgInputRef.current?.click()} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">+ Özel Resim</button>
               <input type="file" ref={bgInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'bg')} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
                'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                '#1e293b',
              ].map((bg, i) => (
                <button key={i} onClick={() => setSettings({...settings, background: bg, customBackground: null})} className="h-8 rounded-md border border-slate-600 hover:scale-105 transition" style={{ background: bg }} />
              ))}
            </div>
          </section>

          {/* 3. Çerçeve & Mockup */}
          <section className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Smartphone size={14} /> Çerçeve</label>
            <div className="grid grid-cols-3 gap-2">
               <button onClick={() => setSettings({...settings, mockup: 'browser'})} className={`p-2 rounded-lg text-xs border ${settings.mockup === 'browser' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Browser</button>
               <button onClick={() => setSettings({...settings, mockup: 'phone'})} className={`p-2 rounded-lg text-xs border ${settings.mockup === 'phone' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Phone</button>
               <button onClick={() => setSettings({...settings, mockup: 'none'})} className={`p-2 rounded-lg text-xs border ${settings.mockup === 'none' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Yok</button>
            </div>
          </section>

          {/* 4. Boyut & Yerleşim */}
          <section className="space-y-4">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><LayoutTemplate size={14} /> Boyutlar</label>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['auto', '1/1', '16/9', '4/5', '9/16'].map(ratio => (
                  <button 
                    key={ratio}
                    onClick={() => setSettings({...settings, aspectRatio: ratio})}
                    className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap border ${settings.aspectRatio === ratio ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {ratio === 'auto' ? 'Auto' : ratio}
                  </button>
                ))}
             </div>
             
             <div className="space-y-1">
               <div className="flex justify-between text-xs text-slate-400"><span>Dolgu</span><span>{settings.padding}px</span></div>
               <input type="range" min="0" max="150" value={settings.padding} onChange={(e) => setSettings({...settings, padding: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
             </div>
          </section>

          {/* 5. Markalama (Filigran) */}
          <section className="space-y-3">
             <div className="flex justify-between items-center">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Sticker size={14} /> Filigran</label>
               <input type="checkbox" checked={settings.showWatermark} onChange={() => setSettings(s => ({...s, showWatermark: !s.showWatermark}))} className="accent-cyan-500" />
             </div>
             
             {settings.showWatermark && (
               <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-3">
                 <input 
                   type="text" 
                   value={settings.watermarkText} 
                   onChange={(e) => setSettings({...settings, watermarkText: e.target.value})}
                   className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                   placeholder="Marka Adınız"
                 />
                 <div className="flex items-center gap-2">
                   <button onClick={() => logoInputRef.current?.click()} className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-1.5 rounded text-slate-300 transition">Logo Yükle</button>
                   {settings.watermarkLogo && <button onClick={() => setSettings({...settings, watermarkLogo: null})} className="text-rose-400 p-1"><X size={14}/></button>}
                   <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />
                 </div>
               </div>
             )}
          </section>

          {/* 6. Transform & Efektler */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Move size={14} /> Efektler</label>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <span className="text-[10px] text-slate-400 block mb-1">Döndür ({settings.rotate}°)</span>
                 <input type="range" min="-20" max="20" value={settings.rotate} onChange={(e) => setSettings({...settings, rotate: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
               </div>
               <div>
                 <span className="text-[10px] text-slate-400 block mb-1">Eğim ({settings.tilt}°)</span>
                 <input type="range" min="-20" max="20" value={settings.tilt} onChange={(e) => setSettings({...settings, tilt: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500" />
               </div>
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 min-w-[320px] flex gap-2">
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'main')} />
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 text-sm font-medium flex items-center justify-center gap-2">
            <Upload size={16} /> <span className="hidden md:inline">Yükle</span>
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {isDownloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download size={16} />}
            İndir
          </button>
        </div>
      </div>

      {/* --- ÖNİZLEME ALANI --- */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 md:p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* REFERANS ALAN (Canvas) */}
        <div 
          ref={exportRef}
          className="relative transition-all duration-300 ease-out shadow-2xl flex items-center justify-center overflow-hidden"
          style={{ 
            background: settings.customBackground ? `url(${settings.customBackground}) center/cover` : settings.background,
            padding: `${settings.padding}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: settings.aspectRatio === 'auto' ? 'auto' : settings.aspectRatio,
            perspective: '1000px', // 3D Tilt için
          }}
        >
          {/* İçerik Container (Dönüşümler buraya uygulanır) */}
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
            {/* 1. Browser Mockup Header */}
            {settings.mockup === 'browser' && (
              <div className={`h-6 md:h-8 px-3 flex items-center gap-2 border-b ${settings.darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className={`ml-2 flex-1 h-4 rounded flex items-center px-2 opacity-40 text-[8px] md:text-[10px] ${settings.darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  snappolish.com
                </div>
              </div>
            )}

            {/* 2. Phone Mockup Notch */}
            {settings.mockup === 'phone' && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-slate-900 rounded-b-xl z-20"></div>
            )}

            {/* Ana Resim */}
            <img 
              src={image} 
              alt="Preview" 
              className="max-w-full object-contain block" 
              style={{
                maxHeight: settings.aspectRatio !== 'auto' ? '100%' : '60vh',
                minWidth: settings.mockup === 'phone' ? '280px' : 'auto'
              }}
              crossOrigin="anonymous" 
            />

            {/* Filigran (Logo + Text) */}
            {settings.showWatermark && (
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 transition-all hover:bg-black/60">
                {settings.watermarkLogo ? (
                  <img src={settings.watermarkLogo} alt="Logo" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <Monitor size={12} className="text-white" />
                )}
                <span className="text-[10px] md:text-xs font-bold text-white shadow-sm">{settings.watermarkText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Masaüstü Alt Kontroller */}
        <div className="hidden md:flex absolute bottom-6 gap-2 bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-xl z-30">
           <button onClick={toggleSidebar} className={`p-2 text-slate-400 hover:text-white rounded-lg transition ${!showSidebar && 'text-cyan-400 bg-slate-700'}`} title="Paneli Gizle"><Sliders size={18} /></button>
           <div className="w-px bg-slate-700 my-1"></div>
           <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-white rounded-lg transition" title="Tam Ekran">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        </div>
      </div>

    </div>
  );
}