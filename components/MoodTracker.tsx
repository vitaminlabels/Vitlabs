import React, { useState, useEffect } from 'react';
import { MoodLog } from '../types';

const MOOD_OPTIONS = [
  { label: 'Senang', emoji: '🌟', color: 'from-amber-400 to-yellow-500' },
  { label: 'Tenang', emoji: '🍃', color: 'from-emerald-400 to-teal-500' },
  { label: 'Cemas', emoji: '☁️', color: 'from-blue-400 to-indigo-500' },
  { label: 'Sedih', emoji: '🌧️', color: 'from-cyan-400 to-blue-600' },
  { label: 'Kesal', emoji: '⚡', color: 'from-rose-400 to-red-500' },
  { label: 'Lelah', emoji: '🔋', color: 'from-indigo-400 to-purple-500' },
];

const FACTORS = [
  { id: 'Kerjaan', label: '💼 Pekerjaan' },
  { id: 'Keluarga', label: '🏠 Keluarga' },
  { id: 'Hubungan', label: '❤️ Hubungan' },
  { id: 'Sosial', label: '👥 Pertemanan' },
  { id: 'Kesehatan', label: '🍎 Kesehatan' },
  { id: 'Tidur', label: '😴 Tidur/Istirahat' },
  { id: 'Finansial', label: '💳 Keuangan' },
  { id: 'MeTime', label: '🎨 Hobi/Diri Sendiri' },
];

const MoodTracker: React.FC = () => {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState<string>('');
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('vitlabs_mood_logs') || localStorage.getItem('temansejiwa_mood_logs');
    if (saved) {
      try {
        const parsed: MoodLog[] = JSON.parse(saved);
        setLogs(parsed);
        calculateStreak(parsed);
      } catch (e) {
        console.error("Failed to load mood logs", e);
      }
    }
  }, []);

  const calculateStreak = (history: MoodLog[]) => {
    if (history.length === 0) {
      setStreak(0);
      return;
    }

    const uniqueDates = Array.from(new Set(
      history.map(log => log.timestamp.split('T')[0])
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length === 0) {
      setStreak(0);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setStreak(0);
      return;
    }

    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const d1 = new Date(uniqueDates[i]);
      const d2 = new Date(uniqueDates[i + 1]);
      const diffTime = Math.abs(d1.getTime() - d2.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const handleToggleFactor = (factorId: string) => {
    if (selectedFactors.includes(factorId)) {
      setSelectedFactors(prev => prev.filter(f => f !== factorId));
    } else {
      setSelectedFactors(prev => [...prev, factorId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    const matchedMood = MOOD_OPTIONS.find(m => m.label === selectedMood);
    const newLog: MoodLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      emoji: matchedMood?.emoji || '🌱',
      intensity,
      factors: selectedFactors,
      note: note.trim() || undefined
    };

    const updatedLogs = [newLog, ...logs];
    const serialized = JSON.stringify(updatedLogs);
    setLogs(updatedLogs);
    localStorage.setItem('vitlabs_mood_logs', serialized);
    localStorage.setItem('temansejiwa_mood_logs', serialized);
    
    setSelectedMood('');
    setIntensity(3);
    setSelectedFactors([]);
    setNote('');
    calculateStreak(updatedLogs);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(log => log.id !== id);
    const serialized = JSON.stringify(updated);
    setLogs(updated);
    localStorage.setItem('vitlabs_mood_logs', serialized);
    localStorage.setItem('temansejiwa_mood_logs', serialized);
    calculateStreak(updated);
  };

  const getStats = () => {
    if (logs.length === 0) return [];
    const counts: { [key: string]: number } = {};
    logs.forEach(log => {
      counts[log.mood] = (counts[log.mood] || 0) + 1;
    });

    return MOOD_OPTIONS.map(m => {
      const count = counts[m.label] || 0;
      const pct = Math.round((count / logs.length) * 100);
      return { ...m, count, pct };
    }).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
  };

  const stats = getStats();

  return (
    <div id="mood-tracker" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-900 p-5 sm:p-6 text-white shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2">
              <span>📊 Jurnal & Pelacak Suasana Hati</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50 mt-1">
              Pantau ritme emosimu setiap hari bersama VitLabs untuk mengenali faktor pemicu dengan jernih.
            </p>
          </div>
          {streak > 0 && (
            <div className="bg-white/15 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/20 self-start sm:self-auto shrink-0 tabular-nums">
              <span>🔥 Beruntun: {streak} Hari</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left column: Add Log */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                Apa yang kamu rasakan hari ini?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {MOOD_OPTIONS.map((moodOpt) => {
                  const isSelected = selectedMood === moodOpt.label;
                  return (
                    <button
                      key={moodOpt.label}
                      type="button"
                      onClick={() => setSelectedMood(moodOpt.label)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer min-h-[78px] ${
                        isSelected
                          ? `bg-gradient-to-br ${moodOpt.color} text-white shadow-xs border-transparent font-bold`
                          : 'bg-slate-50/60 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-slate-800 font-semibold'
                      }`}
                    >
                      <span className="text-2xl mb-1">{moodOpt.emoji}</span>
                      <span className="text-xs whitespace-nowrap">{moodOpt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMood && (
              <div className="space-y-5 animate-fade-in pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Mood Intensity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      Seberapa kuat intensitasnya?
                    </label>
                    <span className="text-xs text-teal-800 dark:text-teal-300 font-bold tabular-nums">
                      Level {intensity} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-semibold px-0.5 mt-1">
                    <span>Sangat Ringan</span>
                    <span>Moderat</span>
                    <span>Sangat Kuat</span>
                  </div>
                </div>

                {/* Factors Choice */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                    Faktor apa yang paling berpengaruh?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FACTORS.map((f) => {
                      const isSelected = selectedFactors.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleToggleFactor(f.id)}
                          className={`text-xs px-3 py-2 rounded-lg border font-semibold transition-all whitespace-nowrap cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-transparent shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Catatan singkat (Opsional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Hari ini cukup padat di kantor, tapi berhasil menyelesaikan tugas utama..."
                    rows={2}
                    className="w-full p-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  Simpan Catatan Suasana Hati
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right column: Stats & History */}
        <div className="lg:col-span-6 space-y-6">
          {/* Stats card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
              Distribusi Suasana Hatimu
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                Belum ada data statistik. Pilih suasana hatimu di panel samping untuk mulai mencatat.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="tabular-nums text-slate-500 dark:text-slate-400">
                        {item.count} kali · {item.pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color}`} 
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History list */}
          <div className="flex flex-col border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex justify-between items-center">
              <span>Riwayat Harian</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tabular-nums">
                Total: {logs.length} catatan
              </span>
            </div>
            
            <div className="overflow-y-auto p-3.5 sm:p-4 space-y-3 max-h-[380px]">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                  🌾 Riwayat masih kosong. Mulailah jurnal pertamamu hari ini.
                </div>
              ) : (
                logs.map((log) => {
                  const formattedDate = new Date(log.timestamp).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <div key={log.id} className="p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex gap-3 relative group">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg">{log.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{log.intensity}/5</span>
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex flex-wrap justify-between items-baseline gap-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{log.mood}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{formattedDate}</span>
                        </div>
                        {log.factors.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {log.factors.map((f, idx) => {
                              const facLabel = FACTORS.find(fact => fact.id === f)?.label || f;
                              return (
                                <React.Fragment key={f}>
                                  <span>{facLabel}</span>
                                  {idx < log.factors.length - 1 && <span aria-hidden="true">·</span>}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}
                        {log.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 break-words">
                            "{log.note}"
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="absolute right-2.5 top-2.5 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                        title="Hapus catatan ini"
                        aria-label="Hapus catatan ini"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
