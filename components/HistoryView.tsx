import React, { useState, useEffect } from 'react';
import { MoodLog, GratitudeEntry, SavedReframe } from '../types';

enum LocalTab {
  MOOD = 'mood_logs',
  REFRAME = 'reframes',
  GRATITUDE = 'gratitude'
}

const HistoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LocalTab>(LocalTab.MOOD);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [reframes, setReframes] = useState<SavedReframe[]>([]);
  const [gratitude, setGratitude] = useState<GratitudeEntry[]>([]);

  useEffect(() => {
    const loadedMoods = localStorage.getItem('vitlabs_mood_logs') || localStorage.getItem('temansejiwa_mood_logs');
    if (loadedMoods) {
      try { setMoodLogs(JSON.parse(loadedMoods)); } catch (e) { console.error(e); }
    }

    const loadedReframes = localStorage.getItem('vitlabs_reframes') || localStorage.getItem('temansejiwa_reframes');
    if (loadedReframes) {
      try { setReframes(JSON.parse(loadedReframes)); } catch (e) { console.error(e); }
    }

    const loadedGratitudes = localStorage.getItem('vitlabs_gratitude') || localStorage.getItem('temansejiwa_gratitude');
    if (loadedGratitudes) {
      try { setGratitude(JSON.parse(loadedGratitudes)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleDeleteMood = (id: string) => {
    const updated = moodLogs.filter(m => m.id !== id);
    const serialized = JSON.stringify(updated);
    setMoodLogs(updated);
    localStorage.setItem('vitlabs_mood_logs', serialized);
    localStorage.setItem('temansejiwa_mood_logs', serialized);
  };

  const handleDeleteReframe = (id: string) => {
    const updated = reframes.filter(r => r.id !== id);
    const serialized = JSON.stringify(updated);
    setReframes(updated);
    localStorage.setItem('vitlabs_reframes', serialized);
    localStorage.setItem('temansejiwa_reframes', serialized);
  };

  const handleDeleteGratitude = (id: string) => {
    const updated = gratitude.filter(g => g.id !== id);
    const serialized = JSON.stringify(updated);
    setGratitude(updated);
    localStorage.setItem('vitlabs_gratitude', serialized);
    localStorage.setItem('temansejiwa_gratitude', serialized);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="cbt-vault-history" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      <div className="bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-800 dark:to-indigo-900 p-5 sm:p-6 text-white shrink-0">
        <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2">
          <span>🔑 Vault Riwayat & Progress VitLabs</span>
        </h2>
        <p className="text-xs sm:text-sm text-teal-50 mt-1">
          Arsip seluruh catatan suasana hati, latihan reframing, dan jurnal syukurmu secara privat.
        </p>
      </div>

      {/* Responsive Segmented Tab Bar */}
      <div className="grid grid-cols-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
        <button
          onClick={() => setActiveTab(LocalTab.MOOD)}
          className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            activeTab === LocalTab.MOOD
              ? 'border-b-teal-600 dark:border-b-teal-400 text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900'
              : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800'
          }`}
        >
          <span>📈 Mood ({moodLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab(LocalTab.REFRAME)}
          className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            activeTab === LocalTab.REFRAME
              ? 'border-b-indigo-600 dark:border-b-indigo-400 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900'
              : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800'
          }`}
        >
          <span>🧠 Reframing ({reframes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab(LocalTab.GRATITUDE)}
          className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            activeTab === LocalTab.GRATITUDE
              ? 'border-b-purple-600 dark:border-b-purple-400 text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900'
              : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800'
          }`}
        >
          <span>🌸 Syukur ({gratitude.length})</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 flex-1">
        {activeTab === LocalTab.MOOD && (
          <div className="space-y-4 animate-fade-in">
            {moodLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                Belum ada riwayat suasana hati yang tersimpan. Mulai catat suasana hatimu di modul Jurnal Mood.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moodLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl relative group">
                    <div className="flex justify-between items-start mb-2 pr-7">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{log.emoji}</span>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{log.mood}</h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                            Intensitas: Level {log.intensity}/5
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{formatDate(log.timestamp)}</span>
                    </div>

                    {log.factors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                        {log.factors.map((f, idx) => (
                          <React.Fragment key={f}>
                            <span>#{f}</span>
                            {idx < log.factors.length - 1 && <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {log.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg mt-3 border border-slate-100 dark:border-slate-800 break-words">
                        "{log.note}"
                      </p>
                    )}

                    <button
                      onClick={() => handleDeleteMood(log.id)}
                      className="absolute right-2.5 top-2.5 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                      aria-label="Hapus riwayat mood"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === LocalTab.REFRAME && (
          <div className="space-y-4 animate-fade-in">
            {reframes.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                Belum ada latihan reframing yang disimpan. Gunakan modul Reframing Pikiran dan simpan hasilnya.
              </div>
            ) : (
              reframes.map((ref) => (
                <div key={ref.id} className="p-4 sm:p-5 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl relative group space-y-3.5">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-700/80 pr-7">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        {ref.distortionType}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Emosi: {ref.emotion}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{formatDate(ref.timestamp)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-red-50/50 dark:bg-red-950/30 p-3.5 rounded-xl border border-red-100 dark:border-red-900/50">
                      <span className="text-[11px] font-bold text-red-800 dark:text-red-300 block mb-1">Pikiran Otomatis:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-200 italic break-words">"{ref.originalThought}"</p>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">Sudut Pandang Alternatif:</span>
                      <ul className="list-disc pl-4 space-y-1 font-medium text-slate-800 dark:text-slate-200">
                        {ref.reframes.map((re, idx) => (
                          <li key={idx} className="break-words">{re}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {ref.explanation && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl leading-relaxed border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Analisis Bias Kognitif:</span> {ref.explanation}
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteReframe(ref.id)}
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                    aria-label="Hapus riwayat reframing"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === LocalTab.GRATITUDE && (
          <div className="space-y-4 animate-fade-in">
            {gratitude.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                Belum ada jurnal rasa syukur yang tersimpan. Mulai tuliskan 3 hal baik hari ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gratitude.map((entry) => (
                  <div key={entry.id} className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl relative group space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/80 pr-7">
                      <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                        ✨ Jurnal Syukur
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{formatDate(entry.timestamp)}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium pt-0.5">
                      {entry.items.map((item, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <span className="text-purple-600 dark:text-purple-400 shrink-0">🌻</span>
                          <span className="break-words">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {entry.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/80 pt-2.5 mt-2 font-medium leading-relaxed italic break-words">
                        Refleksi: "{entry.note}"
                      </p>
                    )}

                    <button
                      onClick={() => handleDeleteGratitude(entry.id)}
                      className="absolute right-2.5 top-2.5 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                      aria-label="Hapus riwayat syukur"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
