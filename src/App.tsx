import { useState, useRef, useEffect, ChangeEvent } from 'react';
import SnakeGame from './components/SnakeGame';
import { TRACKS } from './constants';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Terminal, Github, Twitter, Cpu, Activity, BarChart3, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.log('Playback error:', e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / (duration || 1)) * 100);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans overflow-hidden border-8 border-[#1a1a1e] selection:bg-cyan-500/30">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={skipForward}
      />

      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#0d0d10] relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
          <h1 className="text-lg font-bold tracking-[0.2em] uppercase text-cyan-400">
            Synth_Nexus <span className="text-white/20 font-light truncate">v2.0</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-widest text-white/40 uppercase">
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-white/20" />
            <span>CPU: 14%</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-8">
            <Activity size={12} className="text-white/20" />
            <span>BUFFER: 100%</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-8 text-cyan-400/60 font-bold">
            <Clock size={12} className="text-cyan-400/40" />
            <span>LATENCY: 12ms</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Aside: Music Stream */}
        <aside className="w-72 bg-[#0d0d10] border-r border-white/5 flex flex-col z-10">
          <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6 font-bold flex items-center gap-2">
              <Music size={12} />
              AI Audio Stream
            </h2>
            
            <div className="space-y-3">
              {TRACKS.map((track, idx) => (
                <div 
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`p-3 border rounded-lg flex items-center gap-3 group cursor-pointer transition-all ${
                    idx === currentTrackIndex 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                    idx === currentTrackIndex ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40 group-hover:text-white/60'
                  }`}>
                    {idx === currentTrackIndex && isPlaying ? (
                       <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 h-full bg-cyan-400 animate-[bar_0.6s_infinite]" />
                          <div className="w-0.5 h-2/3 bg-cyan-400 animate-[bar_0.6s_infinite_0.1s]" />
                          <div className="w-0.5 h-1/2 bg-cyan-400 animate-[bar_0.6s_infinite_0.2s]" />
                       </div>
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${idx === currentTrackIndex ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {track.title}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono truncate">{track.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-t border-white/5 bg-[#0a0a0c]">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Currently Playing</div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex-shrink-0 relative overflow-hidden shadow-lg shadow-cyan-500/10">
                <img src={currentTrack.cover} alt="" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate leading-tight mb-0.5">{currentTrack.title}</div>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-2">
                   <Clock size={10} />
                   {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(audioRef.current?.duration || 0)}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main: Game Area */}
        <main className="flex-1 bg-[radial-gradient(circle_at_center,_#16161d_0%,_#0a0a0c_100%)] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative Grid Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          {/* Game Header: Score & Multiplier */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-12 items-center">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1 font-bold">Current Score</div>
              <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] tracking-widest">
                {currentScore.toString().padStart(6, '0')}
              </div>
            </div>
            <div className="text-center border-l border-white/10 pl-12">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1 font-bold">Multiplier</div>
              <div className="text-4xl font-mono font-bold text-white tracking-widest">
                x{(1 + currentScore / 1000).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Snake Game Wrapper */}
          <div className="relative z-10 scale-90 sm:scale-100 transform transform-gpu">
             <SnakeGame onScoreUpdate={(s) => setCurrentScore(s)} />
          </div>

          <div className="mt-12 text-center relative z-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold flex items-center justify-center gap-4">
               <span>ARROWS TO NAVIGATE</span>
               <div className="w-1 h-1 bg-white/10 rounded-full" />
               <span>COLLECT DATA CORES</span>
            </div>
          </div>
        </main>

        {/* Right Aside: Leaderboard */}
        <aside className="hidden xl:block w-72 border-l border-white/5 bg-[#0d0d10] p-6 z-10">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6 font-bold flex items-center gap-2">
            <BarChart3 size={12} />
            Leaderboard
          </h2>
          
          <div className="space-y-4">
            {[
              { rank: '01', user: 'GHOST_UNIT', score: '124,000' },
              { rank: '02', user: 'NEON_HEX', score: '98,420' },
              { rank: '03', user: 'SYNTH_CAT', score: '87,110' },
              { rank: '04', user: 'YOU', score: currentScore.toLocaleString(), active: true },
              { rank: '05', user: 'VOID_WALKER', score: '72,900' },
              { rank: '06', user: 'BIT_RIPPER', score: '65,400' },
            ].map((entry) => (
              <div key={entry.rank} className={`flex justify-between items-end border-b border-white/5 pb-2 group transition-colors ${entry.active ? 'border-cyan-500/20' : ''}`}>
                <span className={`text-[10px] transition-colors ${entry.active ? 'text-cyan-400 font-bold' : 'text-white/60 group-hover:text-white/80'}`}>
                  {entry.rank}. {entry.user}
                </span>
                <span className={`font-mono text-sm transition-colors ${entry.active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]' : 'text-white/80'}`}>
                  {entry.score}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-xl border border-white/5 bg-black/20 space-y-4">
            <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
              <Terminal size={12} className="text-cyan-500" />
              <span>System Logs</span>
            </div>
            <div className="font-mono text-[9px] text-white/30 space-y-1">
              <p>{">"} INITIALIZING_GRID...</p>
              <p className="text-cyan-400/50">{">"} NEURAL_SYNC_ESTABLISHED</p>
              <p>{">"} READY_FOR_INPUT</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Player */}
      <footer className="h-24 bg-[#050507] border-t border-white/10 px-8 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-6">
          <button 
            onClick={skipBack}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
          </button>
          <button 
            onClick={skipForward}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-12 flex flex-col gap-2">
          <div className="flex justify-between text-[10px] text-white/40 font-mono tracking-widest uppercase">
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span className="text-white/20 italic">{currentTrack.title} — {currentTrack.artist}</span>
            <span>{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
          <div className="relative group cursor-pointer h-1 bg-white/10 w-full rounded-full overflow-hidden">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <motion.div 
              className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full" 
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 min-w-[140px] justify-end">
          <div className="w-8 h-8 flex items-center justify-center text-white/40">
            <Volume2 size={16} />
          </div>
          <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-white/40 rounded-full"></div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
    </div>
  );
}
