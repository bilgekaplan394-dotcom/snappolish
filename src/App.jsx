import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Palette, Layers, Maximize, Sliders, Crown, X, Check, Monitor, Minimize, ChevronDown, ChevronUp } from 'lucide-react';

export default function SnapPolishApp() {
  // State: Editing Settings
  const [settings, setSettings] = useState({
    padding: 40,
    shadow: 3, 
    borderRadius: 16,
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    windowControls: true,
    darkMode: true,
    scale: 1
  });

  const [image, setImage] = useState("https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
  const [showProModal, setShowProModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // Sidebar visibility state
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state
  
  const fileInputRef = useRef(null);
  const exportRef = useRef(null);

  // Load html2canvas
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Background Options
  const backgrounds = [
    { id: 'grad1', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', name: 'Indigo' },
    { id: 'grad2', value: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)', name: 'Sunset' },
    { id: 'grad3', value: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', name: 'Ocean' },
    { id: 'grad4', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', name: 'Dark' },
    { id: 'flat1', value: '#e2e8f0', name: 'Clean' },
    { id: 'mesh', value: 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%)', name: 'Mesh', pro: true },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getShadowClass = (level) => {
    switch(level) {
      case 0: return 'shadow-none';
      case 1: return 'shadow-sm';
      case 2: return 'shadow-md';
      case 3: return 'shadow-xl';
      case 4: return 'shadow-2xl';
      case 5: return 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]';
      default: return 'shadow-xl';
    }
  };

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsDownloading(true);
    try {
      if (typeof window.html2canvas === 'undefined') {
        alert('Download tool is loading, please try again in 2 seconds.');
        setIsDownloading(false);
        return;
      }
      const canvas = await window.html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = 'snappolish-design.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  return (
    // Değişiklik 1: h-screen ve overflow-hidden ile tüm sayfayı sabitledik.
    // flex-col-reverse ile mobilde panellerin yerini değiştirdik (Kontrol altta, Resim üstte).
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans flex flex-col-reverse md:flex-row overflow-hidden">
      
      {/* LEFT PANEL: CONTROLS (Mobile: Bottom Sheet, Desktop: Sidebar) */}
      <div 
        className={`bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex flex-col z-30 shadow-2xl transition-all duration-300 ease-in-out
          ${showSidebar 
            ? 'h-[45vh] md:h-screen w-full md:w-80 translate-y-0 md:translate-x-0' // Mobilde %45 yükseklik
            : 'h-12 md:h-screen w-full md:w-0 overflow-hidden opacity-100 md:opacity-0' // Mobilde sadece başlık görünür
          }
        `}
      >
        {/* Mobile Toggle Handle (Sadece mobilde görünür) */}
        <div 
          className="md:hidden w-full flex justify-center py-2 bg-slate-800 cursor-pointer"
          onClick={toggleSidebar}
        >
          <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
        </div>

        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between gap-2 min-w-[320px]">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 rounded-lg text-white">
              <ImageIcon size={18} />
            </div>
            <h1 className="font-bold text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              SnapPolish
            </h1>
          </div>
          {/* Mobile Collapse Button */}
          <button onClick={toggleSidebar} className="md:hidden text-slate-400">
            {showSidebar ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 md:space-y-8 custom-scrollbar min-w-[320px]">
          <section className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Palette size={14} /> Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => bg.pro ? setShowProModal(true) : setSettings({...settings, background: bg.value})}
                  className={`h-10 rounded-lg border-2 transition-all relative overflow-hidden group ${settings.background === bg.value ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-transparent hover:border-slate-600'}`}
                  style={{ background: bg.value }}
                >
                  {bg.pro && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Crown size={14} className="text-amber-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> Layout
            </label>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Padding</span>
                <span>{settings.padding}px</span>
              </div>
              <input type="range" min="0" max="120" value={settings.padding} onChange={(e) => setSettings({...settings, padding: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Border Radius</span>
                <span>{settings.borderRadius}px</span>
              </div>
              <input type="range" min="0" max="40" value={settings.borderRadius} onChange={(e) => setSettings({...settings, borderRadius: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} /> Effects
            </label>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Shadow</span>
                <span>{settings.shadow}</span>
              </div>
              <input type="range" min="0" max="5" value={settings.shadow} onChange={(e) => setSettings({...settings, shadow: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
               <span className="text-sm text-slate-300">Window Controls</span>
               <button onClick={() => setSettings({...settings, windowControls: !settings.windowControls})} className={`w-10 h-6 rounded-full transition-colors relative ${settings.windowControls ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.windowControls ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </button>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
               <span className="text-sm text-slate-300">Dark Mode</span>
               <button onClick={() => setSettings({...settings, darkMode: !settings.darkMode})} className={`w-10 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </button>
             </div>
          </section>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-amber-500" />
              <h4 className="font-bold text-amber-500 text-sm">SnapPolish Pro</h4>
            </div>
            <p className="text-xs text-slate-400 mb-3">All features unlocked for testing.</p>
          </div>
        </div>

        <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-900 min-w-[320px]">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 transition-all mb-3 text-sm font-medium">
            <Upload size={16} /> Upload Image
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl shadow-lg shadow-cyan-900/20 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <Download size={16} />
            )}
            {isDownloading ? 'Preparing...' : 'Download Image'}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 md:p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* EXPORT REF WRAPPER */}
        {/* Değişiklik 2: Mobilde resmin çok büyük olmasını engellemek için max-h-[50vh] ekledik. */}
        <div 
          ref={exportRef}
          className="relative transition-all duration-300 ease-out shadow-2xl flex items-center justify-center"
          style={{ 
            background: settings.background,
            padding: `${settings.padding}px`,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <div 
            className={`relative overflow-hidden transition-all duration-300 ${getShadowClass(settings.shadow)} ${settings.darkMode ? 'bg-slate-900' : 'bg-white'}`}
            style={{ borderRadius: `${settings.borderRadius}px` }}
          >
            {settings.windowControls && (
              <div className={`h-6 md:h-8 px-2 md:px-4 flex items-center gap-1.5 md:gap-2 border-b ${settings.darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400"></div>
                <div className={`ml-2 md:ml-4 flex-1 h-4 md:h-5 rounded-md flex items-center px-2 opacity-30 text-[8px] md:text-[10px] ${settings.darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  snappolish.com
                </div>
              </div>
            )}

            <img src={image} alt="Preview" className="max-w-full max-h-[40vh] md:max-h-[60vh] object-contain block" crossOrigin="anonymous" />

            <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 opacity-30 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[8px] md:text-[10px] font-bold text-white">
                 <Monitor size={10} /> SnapPolish
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROL BAR - Desktop Only */}
        <div className="hidden md:flex absolute bottom-6 gap-2 bg-slate-800/80 backdrop-blur border border-slate-700 p-1.5 rounded-lg shadow-xl z-30">
           <button 
             onClick={toggleSidebar}
             className={`p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors ${!showSidebar && 'text-cyan-400 bg-slate-700'}`}
             title={showSidebar ? "Hide Settings" : "Show Settings"}
           >
             <Sliders size={16} />
           </button>
           <div className="w-px bg-slate-700 my-1"></div>
           <button 
             onClick={toggleFullscreen}
             className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" 
             title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
           >
             {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
           </button>
        </div>
      </div>

      {showProModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-0 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 bg-black/20 text-slate-400 hover:text-white p-1 rounded-full z-10 hover:bg-white/10">
              <X size={20} />
            </button>
            <div className="h-32 bg-gradient-to-r from-amber-400 to-orange-600 relative flex items-center justify-center">
              <Crown size={48} className="text-white drop-shadow-lg" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white text-center mb-1">SnapPolish PRO</h2>
              <p className="text-sm text-slate-400 text-center mb-6">You are in test mode.</p>
              <button onClick={() => setShowProModal(false)} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all">
                Continue Testing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}