import React, { useState } from 'react';
import { generateReframe } from '../services/geminiService';

const ReframingTool: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [thought, setThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ distortionType: string, explanation: string, reframes: string[] } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleAnalyze = async () => {
    if (!thought || !emotion) return;
    setLoading(true);
    setErrorMsg(null);
    setIsSaved(false);
    try {
      const data = await generateReframe(thought, emotion);
      setResult(data);
      setStep(3);
    } catch (e) {
      setErrorMsg("Terjadi kendala saat menganalisis pikiran. Silakan coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    if (!result || !thought || !emotion) return;
    
    try {
      const savedStr = localStorage.getItem('vitlabs_reframes') || localStorage.getItem('temansejiwa_reframes') || '[]';
      const parsed = JSON.parse(savedStr);
      
      const newRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        originalThought: thought,
        emotion: emotion,
        distortionType: result.distortionType,
        explanation: result.explanation,
        reframes: result.reframes
      };

      const serialized = JSON.stringify([newRecord, ...parsed]);
      localStorage.setItem('vitlabs_reframes', serialized);
      localStorage.setItem('temansejiwa_reframes', serialized);
      setIsSaved(true);
    } catch (e) {
      console.error("Failed to save reframing exercise", e);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
          1. Pikiran otomatis apa yang sedang berkecamuk di kepalamu?
        </label>
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          className="w-full p-3.5 sm:p-4 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          rows={4}
          placeholder="Contoh: Teman saya tidak membalas pesan sejak pagi, pasti dia membenci saya dan sengaja mengabaikan saya."
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
          2. Emosi apa saja yang kamu rasakan akibat pikiran tersebut?
        </label>
        <input
          type="text"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="w-full p-3.5 sm:p-4 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="Contoh: Sangat cemas, sedih, merasa tidak berharga"
        />
      </div>
      <button
        onClick={() => setStep(2)}
        disabled={!thought.trim() || !emotion.trim()}
        className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        Lanjut ke Analisa Jebakan Kognitif
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in py-6 sm:py-10 max-w-lg mx-auto">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
        🧠
      </div>
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">Mari Kita Analisa Bersama</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
          Seringkali pikiran kita terjebak dalam kacamata bias kognitif. VitLabs AI akan membantumu mendeteksi dan mengurainya secara objektif.
        </p>
      </div>
      <div className="w-full bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl text-left border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <div>
          <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold block">Pikiran Otomatis:</span>
          <p className="text-slate-800 dark:text-slate-200 italic text-xs sm:text-sm mt-0.5">"{thought}"</p>
        </div>
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Emosi yang dirasakan: </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{emotion}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="w-full p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={() => setStep(1)}
          className="sm:flex-1 py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
        >
          Ubah Catatan
        </button>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="sm:flex-[2] py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs disabled:opacity-70 flex justify-center items-center cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sedang Menganalisis...</span>
            </>
          ) : (
            <span>Temukan Sudut Pandang Baru</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (!result) return null;
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 p-4 sm:p-5 rounded-xl">
          <div className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-2">
            <span>⚠️ Terdeteksi Pola Bias Kognitif:</span>
            <span className="underline decoration-amber-400">{result.distortionType}</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/85 dark:text-amber-200/90 leading-relaxed font-medium">
            {result.explanation}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-sm sm:text-base">
            3 Sudut Pandang Alternatif yang Lebih Seimbang:
          </h3>
          <div className="space-y-3">
            {result.reframes.map((reframe, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {reframe}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isSaved ? (
            <div className="flex-1 py-3.5 px-4 text-center bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <span>✓ Tersimpan di Vault Riwayat</span>
            </div>
          ) : (
            <button
              onClick={handleSaveResult}
              className="flex-1 py-3.5 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-xs active:scale-[0.99] text-xs sm:text-sm cursor-pointer"
            >
              Simpan Hasil Latihan ke Vault
            </button>
          )}

          <button
            onClick={() => {
              setStep(1);
              setThought('');
              setEmotion('');
              setResult(null);
              setIsSaved(false);
            }}
            className="flex-1 py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            Lakukan Latihan Baru
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 p-5 sm:p-6 text-white shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2">
              <span>🧠 Latihan Reframing Pikiran</span>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
              Metode Cognitive Behavioral Therapy (CBT) bersama VitLabs untuk mengurai bias pikiran negatif.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-lg self-start sm:self-auto shrink-0 tabular-nums">
            <span>Langkah {step} dari 3</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 sm:p-7 lg:p-8 flex-1">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ReframingTool;
