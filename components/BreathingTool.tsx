import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BreathingPattern {
  name: string;
  description: string;
  cycle: { state: string; duration: number }[];
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: "Metode Kotak (Box Breathing)",
    description: "Digunakan untuk ketenangan instan dan fokus mendalam saat menghadapi situasi penuh tekanan.",
    cycle: [
      { state: "Inhale", duration: 4 },
      { state: "Hold", duration: 4 },
      { state: "Exhale", duration: 4 },
      { state: "Hold Empty", duration: 4 }
    ]
  },
  {
    name: "Metode Relaksasi (4-7-8)",
    description: "Menenangkan sistem saraf otonom untuk meredakan kecemasan berlebih dan membantu istirahat.",
    cycle: [
      { state: "Inhale", duration: 4 },
      { state: "Hold", duration: 7 },
      { state: "Exhale", duration: 8 }
    ]
  },
  {
    name: "Napas Seimbang (4-4)",
    description: "Ritme sederhana dan teratur bagi pemula untuk menstabilkan detak jantung.",
    cycle: [
      { state: "Inhale", duration: 4 },
      { state: "Exhale", duration: 4 }
    ]
  }
];

const BreathingTool: React.FC = () => {
  const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPattern = BREATHING_PATTERNS[selectedPatternIndex];
  const currentStep = currentPattern.cycle[cycleIndex];

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
  };

  const playChime = (type: 'high' | 'low') => {
    try {
      initAudioCtx();
      if (!audioCtxRef.current) return;
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'high' ? 523.25 : 329.63, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Web Audio chime disabled or throttled", e);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      setSecondsRemaining(currentStep.duration);
      playChime(currentStep.state === 'Inhale' ? 'high' : 'low');
    } else {
      setCycleIndex(0);
      setSecondsRemaining(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, cycleIndex, selectedPatternIndex]);

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setCycleIndex((prevIdx) => {
            const nextIdx = (prevIdx + 1) % currentPattern.cycle.length;
            if (nextIdx === 0) {
              setCompletedCycles(c => c + 1);
            }
            return nextIdx;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, cycleIndex, selectedPatternIndex]);

  const handleToggle = () => {
    initAudioCtx();
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCompletedCycles(0);
    }
  };

  const getStepInstruction = (state: string) => {
    switch (state) {
      case 'Inhale': return 'Tarik Napas Perlahan';
      case 'Hold': return 'Tahan Napas';
      case 'Exhale': return 'Hembuskan Perlahan';
      case 'Hold Empty': return 'Tahan Sejenak';
      default: return 'Bersiap';
    }
  };

  const getStepSubText = (state: string) => {
    switch (state) {
      case 'Inhale': return 'Rasakan udara bersih masuk melalui hidung...';
      case 'Hold': return 'Biarkan tubuh menyerap ketenangan...';
      case 'Exhale': return 'Lepaskan ketegangan secara perlahan...';
      case 'Hold Empty': return 'Nikmati ruang hening sejenak...';
      default: return '';
    }
  };

  const getCircleScale = () => {
    if (!isPlaying) return 1.0;
    switch (currentStep.state) {
      case 'Inhale': return 1.45;
      case 'Hold': return 1.45;
      case 'Exhale': return 1.0;
      case 'Hold Empty': return 1.0;
      default: return 1.0;
    }
  };

  const getCircleColorClass = () => {
    if (!isPlaying) return 'bg-teal-600 shadow-teal-200/60 dark:shadow-teal-950/60';
    switch (currentStep.state) {
      case 'Inhale': return 'bg-teal-600 shadow-teal-200/70 dark:shadow-teal-950/60';
      case 'Hold': return 'bg-indigo-600 shadow-indigo-200/70 dark:shadow-indigo-950/60';
      case 'Exhale': return 'bg-emerald-600 shadow-emerald-200/70 dark:shadow-emerald-950/60';
      case 'Hold Empty': return 'bg-purple-600 shadow-purple-200/70 dark:shadow-purple-950/60';
      default: return 'bg-teal-600 shadow-teal-200/70 dark:shadow-teal-950/60';
    }
  };

  return (
    <div id="breathing-tool" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-800 dark:to-emerald-900 p-5 sm:p-6 text-white shrink-0">
        <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2">
          <span>🌊 Latihan Pernapasan Relaksasi</span>
        </h2>
        <p className="text-xs sm:text-sm text-teal-50 mt-1">
          Panduan ritme visual VitLabs untuk menenangkan sistem saraf otonom saat cemas atau tegang.
        </p>
      </div>

      <div className="p-5 sm:p-7 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Virtual Breathing Visualizer */}
        <div className="lg:col-span-6 lg:order-2 flex flex-col items-center justify-center py-4 sm:py-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
          <div className="h-56 sm:h-64 flex items-center justify-center relative w-full overflow-hidden">
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  key="ring1"
                  initial={{ scale: 0.85, opacity: 0.45 }}
                  animate={{ 
                    scale: getCircleScale() * 1.25, 
                    opacity: currentStep?.state === 'Inhale' ? 0.3 : 0.12 
                  }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: currentStep?.duration || 4, ease: "easeInOut" }}
                  className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-teal-300 dark:bg-teal-500/40 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{ scale: getCircleScale() }}
              transition={{ duration: currentStep?.duration || 4, ease: "easeInOut" }}
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center text-white shadow-xl z-10 select-none ${getCircleColorClass()}`}
            >
              <span className="text-3xl sm:text-4xl">🌱</span>
              {isPlaying && (
                <motion.span 
                  className="text-xl sm:text-2xl font-extrabold mt-1 tabular-nums"
                  key={secondsRemaining}
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {secondsRemaining}s
                </motion.span>
              )}
            </motion.div>
          </div>

          <div className="text-center mt-2 space-y-1.5 min-h-[4.25rem] flex flex-col items-center justify-start px-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {isPlaying ? getStepInstruction(currentStep.state) : "Siap untuk Rileks?"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              {isPlaying
                ? getStepSubText(currentStep.state)
                : "Ambil posisi duduk yang nyaman, rilekskan bahu, lalu tekan tombol mulai."}
            </p>
          </div>

          <button
            onClick={handleToggle}
            className={`mt-4 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            <span>{isPlaying ? 'Hentikan Latihan' : 'Mulai Latihan Napas'}</span>
          </button>
        </div>

        {/* Left Side on Laptop: Patterns Selection */}
        <div className="lg:col-span-6 lg:order-1 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pilih Pola Pernapasan
          </h3>
          <div className="space-y-3">
            {BREATHING_PATTERNS.map((pattern, idx) => {
              const totalSec = pattern.cycle.map(c => c.duration).reduce((a, b) => a + b, 0);
              const isSelected = selectedPatternIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isPlaying) {
                      setSelectedPatternIndex(idx);
                    }
                  }}
                  disabled={isPlaying}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 dark:border-teal-500/80 ring-2 ring-teal-500/15'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-slate-50/60 dark:hover:bg-slate-800'
                  } ${isPlaying ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{pattern.name}</span>
                    <span className="text-xs text-teal-800 dark:text-teal-300 font-semibold tabular-nums">
                      {totalSec} detik / siklus
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pattern.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {pattern.cycle.map((c, i) => (
                      <React.Fragment key={i}>
                        <span className="tabular-nums">{c.state} {c.duration}s</span>
                        {i < pattern.cycle.length - 1 && <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          
          {isPlaying && (
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 flex justify-between items-center animate-fade-in">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Status Latihan</span>
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold tabular-nums">
                  Siklus ke-{completedCycles + 1} sedang berjalan
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Selesai</span>
                <span className="text-sm sm:text-base text-teal-700 dark:text-teal-400 font-extrabold tabular-nums">
                  {completedCycles} Siklus
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BreathingTool;
