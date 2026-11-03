import React, { useState, useEffect } from 'react';
import { GratitudeEntry } from '../types';

const GRATITUDE_PROMPTS = [
  "Sebutkan satu hal kecil yang membuatmu tersenyum hari ini.",
  "Sebutkan satu orang yang kehadirannya kamu syukuri.",
  "Sebutkan satu keberhasilan atau usaha kecil yang kamu banggakan hari ini.",
  "Sebutkan kenyamanan fisik yang kamu nikmati hari ini (minuman hangat, udara segar).",
  "Sebutkan rintangan yang berhasil kamu lewati dengan sabar."
];

const GratitudeJournal: React.FC = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [item3, setItem3] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [activePrompt, setActivePrompt] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('vitlabs_gratitude') || localStorage.getItem('temansejiwa_gratitude');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gratitude logs", e);
      }
    }
    setActivePrompt(Math.floor(Math.random() * GRATITUDE_PROMPTS.length));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item1.trim() || !item2.trim() || !item3.trim()) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    const newEntry: GratitudeEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      items: [item1.trim(), item2.trim(), item3.trim()],
      note: note.trim() || undefined
    };

    const updated = [newEntry, ...entries];
    const serialized = JSON.stringify(updated);
    setEntries(updated);
    localStorage.setItem('vitlabs_gratitude', serialized);
    localStorage.setItem('temansejiwa_gratitude', serialized);

    setItem1('');
    setItem2('');
    setItem3('');
    setNote('');
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 3500);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    const serialized = JSON.stringify(updated);
    setEntries(updated);
    localStorage.setItem('vitlabs_gratitude', serialized);
    localStorage.setItem('temansejiwa_gratitude', serialized);
  };

  const formattedDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div id="gratitude-journal" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      <div className="bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-800 dark:to-indigo-900 p-5 sm:p-6 text-white shrink-0">
        <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2">
          <span>🌸 Jurnal Rasa Syukur (3 Berkat Hari Ini)</span>
        </h2>
        <p className="text-xs sm:text-sm text-teal-50 mt-1">
          Latihan bersyukur bersama VitLabs untuk melatih otak mengenali hal-hal baik di sekitarmu.
        </p>
      </div>

      <div className="p-5 sm:p-7 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/70 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
            <span className="font-bold block mb-1">💡 Inspirasi Refleksi Hari Ini:</span>
            <p className="italic">"{GRATITUDE_PROMPTS[activePrompt]}"</p>
          </div>

          {submitted ? (
            <div className="p-6 sm:p-8 bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-2xl text-center space-y-3 animate-fade-in py-12">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/70 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-teal-900 dark:text-teal-300">
                Jurnal Tersimpan! Terima kasih sudah bersyukur hari ini.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                Menuliskan hal positif membantu menjaga keseimbangan emosi dan ketenangan pikiran.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Tuliskan 3 Hal Baik Hari Ini:
              </h3>

              {validationError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                  Mohon lengkapi ketiga poin syukur terlebih dahulu ya, Kak.
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 tabular-nums">
                    1
                  </div>
                  <input
                    type="text"
                    required
                    value={item1}
                    onChange={(e) => setItem1(e.target.value)}
                    placeholder="Contoh: Menikmati teh hangat saat pagi hari"
                    className="flex-1 p-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                  />
                </div>
                
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 tabular-nums">
                    2
                  </div>
                  <input
                    type="text"
                    required
                    value={item2}
                    onChange={(e) => setItem2(e.target.value)}
                    placeholder="Contoh: Rekan kerja membantu menyelesaikan pekerjaan"
                    className="flex-1 p-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 tabular-nums">
                    3
                  </div>
                  <input
                    type="text"
                    required
                    value={item3}
                    onChange={(e) => setItem3(e.target.value)}
                    placeholder="Contoh: Berhasil beristirahat tepat waktu"
                    className="flex-1 p-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Catatan Refleksi Tambahan (Opsional):
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ceritakan mengapa hal-hal di atas terasa berharga untukmu hari ini..."
                  rows={2}
                  className="w-full p-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
              >
                Simpan 3 Berkat Hari Ini
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Diary Output */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex flex-col border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-50/80 dark:bg-slate-800/60 px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex justify-between items-center">
              <span>💌 Galeri Jurnal Syukur</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tabular-nums">{entries.length} entri</span>
            </div>

            <div className="overflow-y-auto p-3.5 sm:p-4 space-y-3.5 max-h-[440px]">
              {entries.length === 0 ? (
                <div className="text-center py-14 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                  🌾 Belum ada lembaran jurnal syukur. Mulai isi pertama kalinya di formulir!
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="p-4 bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl relative group">
                    <div className="flex justify-between items-center mb-2.5 pr-7">
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                        ✨ Jurnal Syukur
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">
                        {formattedDate(entry.timestamp)}
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                      {entry.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-teal-600 dark:text-teal-400 shrink-0">🌻</span>
                          <span className="break-words">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {entry.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/70 dark:border-slate-700/70 pt-2.5 mt-2.5 leading-relaxed break-words">
                        <span className="font-bold text-slate-700 dark:text-slate-200">Refleksi:</span> "{entry.note}"
                      </p>
                    )}

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="absolute right-2.5 top-2.5 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                      title="Hapus entri ini"
                      aria-label="Hapus entri ini"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GratitudeJournal;
