import Camera from './components/Camera';

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center gap-12">
        <header className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Project nodBeat</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50">
            Motion to Music
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            당신의 고개 끄덕임과 주변 환경이 만나 실시간 음악이 탄생합니다.
            <br className="hidden md:block" />
            AI가 분석하는 당신만의 비트를 경험해보세요.
          </p>
        </header>

        <section className="w-full flex flex-col items-center gap-8">
          <Camera />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-colors group">
              <div className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">🥁</span>
                BPM Analysis
              </div>
              <p className="text-gray-500 text-sm">고개를 끄덕여 비트를 조절하세요.</p>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors group">
              <div className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">🌆</span>
                Spatial Vibe
              </div>
              <p className="text-gray-500 text-sm">공간에 어울리는 악기를 선정합니다.</p>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-pink-500/30 transition-colors group">
              <div className="text-pink-400 font-bold mb-2 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-pink-500/10 rounded-lg group-hover:scale-110 transition-transform">🧠</span>
                AI Composer
              </div>
              <p className="text-gray-500 text-sm">나이와 분위기에 맞는 비트를 생성합니다.</p>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-12 text-gray-600 text-sm">
          © 2026 nodBeat - AI Generative Music Project
        </footer>
      </main>
    </div>
  );
}

export default App;
