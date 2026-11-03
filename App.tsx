import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ReframingTool from './components/ReframingTool';
import BreathingTool from './components/BreathingTool';
import MoodTracker from './components/MoodTracker';
import GratitudeJournal from './components/GratitudeJournal';
import HistoryView from './components/HistoryView';
import { AppView, MoodLog } from './types';
import { DISCLAIMER_TEXT } from './constants';
import { 
  Home, 
  MessageSquare, 
  Brain, 
  Wind, 
  Heart, 
  History, 
  PhoneCall, 
  Activity, 
  User,
  Quote,
  Menu,
  X,
  ArrowRight,
  Lock,
  Moon,
  Sun
} from 'lucide-react';

// CBT daily affirmations and quotes in Indonesian
const MEDITATION_QUOTES = [
  { text: "Pikiranmu adalah seumpama kacamata. Kadang berdebu, namun kamu selalu bisa membersihkannya dan melihat dunia secara lebih jernih.", author: "Konsep CBT" },
  { text: "Menerima kecemasan bukan berarti menyerah, melainkan mengizinkan tubuhmu untuk tenang tanpa tergesa-gesa.", author: "Dr. Claire Weekes" },
  { text: "Emosimu adalah rambu lalu lintas sementara, bukan tempat tinggal permanenmu. Biarkan dia lewat seperti awan.", author: "VitLabs" },
  { text: "Kamu tidak perlu mengontrol semua hal luar untuk mendapatkan kedamaian. Cukup kontrol bagaimana kamu merespon pikiranmu sendiri.", author: "Epictetus" },
  { text: "Rasa syukur adalah jembatan terkecil yang menghubungkan jiwamu kembali ke momen hari ini yang damai.", author: "VitLabs Insight" },
  { text: "Satu helaan napas yang dalam adalah jeda sakral di mana kamu memilih hidup di masa kini, bukan masa lalu atau kekhawatiran masa depan.", author: "Mindfulness" }
];

const NAV_ITEMS = [
  { view: AppView.LANDING, label: "Dashboard", icon: Home },
  { view: AppView.CHAT, label: "Teman Bicara (AI)", icon: MessageSquare },
  { view: AppView.REFRAME, label: "Reframing Pikiran", icon: Brain },
  { view: AppView.BREATHING, label: "Latihan Bernapas", icon: Wind },
  { view: AppView.MOOD, label: "Jurnal Mood", icon: Activity },
  { view: AppView.GRATITUDE, label: "Jurnal Syukur", icon: Heart },
  { view: AppView.HISTORY, label: "Vault Riwayat", icon: History },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('vitlabs_theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [username, setUsername] = useState('');
  const [inputName, setInputName] = useState('');
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // States for quick mood logger inside dashboard
  const [quickMoodLogged, setQuickMoodLogged] = useState(false);
  const [userStreak, setUserStreak] = useState(0);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('vitlabs_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('vitlabs_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check local storage for configs (support both vitlabs_* and legacy temansejiwa_*)
    const accepted = localStorage.getItem('vitlabs_disclaimer_accepted') || localStorage.getItem('temansejiwa_disclaimer_accepted');
    const name = localStorage.getItem('vitlabs_user_name') || localStorage.getItem('temansejiwa_user_name');
    
    if (accepted === 'true') {
      setDisclaimerAccepted(true);
    }
    if (name) {
      setUsername(name);
      setInputName(name);
    }

    // Load random quote of the day
    const randomIndex = Math.floor(Math.random() * MEDITATION_QUOTES.length);
    setDailyQuote(MEDITATION_QUOTES[randomIndex]);

    // Calculate logging streak
    const savedMoodLogs = localStorage.getItem('vitlabs_mood_logs') || localStorage.getItem('temansejiwa_mood_logs');
    if (savedMoodLogs) {
      try {
        const parsed: MoodLog[] = JSON.parse(savedMoodLogs);
        calculateStreak(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, [view]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const calculateStreak = (history: MoodLog[]) => {
    if (history.length === 0) {
      setUserStreak(0);
      return;
    }
    const uniqueDates = Array.from(new Set(
      history.map(log => log.timestamp.split('T')[0])
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setUserStreak(0);
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
    setUserStreak(currentStreak);
  };

  const handleAcceptDisclaimer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = inputName.trim();
    const finalName = trimmedName || 'Sahabat';
    
    localStorage.setItem('vitlabs_disclaimer_accepted', 'true');
    localStorage.setItem('temansejiwa_disclaimer_accepted', 'true');
    localStorage.setItem('vitlabs_user_name', finalName);
    localStorage.setItem('temansejiwa_user_name', finalName);
    
    setUsername(finalName);
    setDisclaimerAccepted(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  const handleQuickMood = (moodName: string, emoji: string, intensity: number) => {
    const newLog: MoodLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mood: moodName,
      emoji: emoji,
      intensity: intensity,
      factors: ['Diri Sendiri'],
      note: 'Log cepat dari dashboard VitLabs'
    };

    try {
      const saved = localStorage.getItem('vitlabs_mood_logs') || localStorage.getItem('temansejiwa_mood_logs') || '[]';
      const parsed = JSON.parse(saved);
      const updated = [newLog, ...parsed];
      const serialized = JSON.stringify(updated);
      localStorage.setItem('vitlabs_mood_logs', serialized);
      localStorage.setItem('temansejiwa_mood_logs', serialized);
      calculateStreak(updated);
      setQuickMoodLogged(true);
      setTimeout(() => setQuickMoodLogged(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Disclaimer Dialog Mode
  if (!disclaimerAccepted) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8 text-center space-y-6 border border-slate-200/80 dark:border-slate-800 relative animate-fade-in">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Ubah Tema"
            title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Malam"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 rounded-2xl flex items-center justify-center mx-auto text-2xl sm:text-3xl">
            🌱
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 dark:text-teal-300 tracking-tight">VitLabs</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pendamping Kesehatan Mental Berbasis CBT</p>
          </div>

          <form onSubmit={handleAcceptDisclaimer} className="space-y-5 text-left">
            <div>
              <label htmlFor="nickname-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Siapa nama panggilanmu, Kak?
              </label>
              <div className="relative">
                <input
                  id="nickname-input"
                  type="text"
                  maxLength={20}
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Masukkan nama panggilan..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/70 dark:border-slate-700/80">
              <p className="font-bold mb-1.5 text-slate-800 dark:text-slate-100">
                Penting untuk Dibaca & Dipahami:
              </p>
              <p>{DISCLAIMER_TEXT.trim()}</p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              Saya Mengerti & Mulai Bersama VitLabs
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50/70 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header for Mobile (< md) with Hamburger Menu on Top-Left */}
      <header className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-800 dark:hover:text-teal-300 rounded-xl border border-slate-200/80 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setView(AppView.LANDING)}
            className="flex items-center gap-2 text-teal-900 dark:text-teal-300 font-extrabold text-lg tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="bg-teal-50 dark:bg-teal-950/70 w-8 h-8 rounded-lg border border-teal-100 dark:border-teal-800/60 flex items-center justify-center text-base">🌱</span>
            <span>VitLabs</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
            Hi, {username}
          </span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer on Mobile (Left Side) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
          <div 
            className="absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl p-5 flex flex-col justify-between z-10 animate-slide-in-left overflow-y-auto border-r border-slate-200 dark:border-slate-800">
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="bg-teal-50 dark:bg-teal-950/70 w-8 h-8 rounded-lg border border-teal-100 dark:border-teal-800/60 flex items-center justify-center text-base">🌱</span>
                  <span className="font-extrabold text-lg text-teal-900 dark:text-teal-300 tracking-tight">VitLabs</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User profile card */}
              <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Selamat datang,</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block truncate">{username}</span>
                </div>
              </div>

              {/* Nav Items stack */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = view === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        setView(item.view);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {/* Theme Toggle inside Mobile Drawer */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-teal-600 shrink-0" />}
                  <span>{isDarkMode ? 'Mode Malam Aktif' : 'Mode Terang Aktif'}</span>
                </span>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  Ubah
                </span>
              </button>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Data Tersimpan Privat</span>
                </div>
                <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
                  Seluruh jurnal dan percakapan tersimpan lokal di perangkatmu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar on Tablet (md) & Laptop/Desktop (lg+) */}
      <aside className="hidden md:flex md:w-56 lg:w-64 xl:w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex-col justify-between p-4 lg:p-6 shrink-0 md:h-dvh sticky top-0 z-20 overflow-y-auto transition-colors">
        <div className="space-y-6">
          {/* Logo Brand */}
          <button 
            onClick={() => setView(AppView.LANDING)}
            className="flex items-center gap-2.5 text-teal-900 dark:text-teal-300 font-extrabold text-xl select-none text-left w-full hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="bg-teal-50 dark:bg-teal-950/70 w-10 h-10 rounded-xl border border-teal-100 dark:border-teal-800/60 flex items-center justify-center text-xl shrink-0">🌱</span>
            <div className="leading-tight min-w-0">
              <span className="block tracking-tight">VitLabs</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">Pendamping CBT</span>
            </div>
          </button>

          {/* User badge */}
          <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Hi, Sahabat</span>
              <span className="text-xs lg:text-sm font-bold text-slate-900 dark:text-slate-100 block truncate">{username}</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Dark Mode Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Malam"}
          >
            <span className="flex items-center gap-2.5 truncate">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-teal-600 shrink-0" />
              )}
              <span className="truncate">{isDarkMode ? 'Mode Malam' : 'Mode Terang'}</span>
            </span>
            <span
              className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${
                isDarkMode ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-2xs" />
            </span>
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Data Tersimpan Privat</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
              Jurnal dan sesi refleksimu tersimpan aman di peramban perangkat ini.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:h-dvh md:overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto w-full">
          
          {/* LANDING VIEW / DASHBOARD */}
          {view === AppView.LANDING && (
            <div className="space-y-5 sm:space-y-6 pb-6 animate-fade-in">
              
              {/* Hero Welcome Banner */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-gradient-to-br from-teal-600 via-teal-700 to-slate-800 dark:from-teal-900/90 dark:via-slate-900 dark:to-slate-900 text-white p-5 sm:p-7 lg:p-8 rounded-2xl shadow-sm border border-teal-500/20 dark:border-teal-800/50">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-teal-100 dark:text-teal-300">
                    <span>{getGreeting()}</span>
                    <span aria-hidden="true">·</span>
                    <span>VitLabs CBT Workspace</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug" style={{ textWrap: 'balance' }}>
                    Apa yang kamu butuhkan hari ini, Kak {username}?
                  </h1>
                  <p className="text-teal-50/90 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Pilih modul terapi kognitif dan regulasi emosi yang paling sesuai dengan perasaanmu saat ini.
                  </p>
                </div>

                {/* Streak Info Card */}
                <div className="w-full sm:w-auto bg-white/10 dark:bg-slate-800/80 backdrop-blur-xs border border-white/15 dark:border-slate-700 px-4 py-3.5 rounded-xl flex items-center gap-3.5 shrink-0">
                  <div className="w-10 h-10 bg-amber-400 text-slate-900 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                    🔥
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-teal-100 dark:text-slate-400 block">Konsistensi Jurnal</span>
                    <span className="text-sm sm:text-base font-extrabold text-white tabular-nums">{userStreak} Hari Beruntun</span>
                  </div>
                </div>
              </div>

              {/* Affirmation Quote Panel */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start sm:items-center gap-3.5 sm:gap-4 transition-colors">
                <div className="p-2.5 sm:p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-100 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 shrink-0">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic font-medium leading-relaxed">
                    "{dailyQuote.text}"
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    — {dailyQuote.author}
                  </p>
                </div>
              </div>

              {/* Quick Mood Logger & Tracker Panel */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      Catat Cepat Suasana Hati
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bagaimana perasaanmu saat ini? Ketuk salah satu untuk menyimpan ke jurnal harian.
                    </p>
                  </div>
                  {quickMoodLogged && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ Tersimpan ke Jurnal Mood
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
                  {[
                    { label: "Senang", emoji: "🌟", hover: "hover:bg-amber-50/70 dark:hover:bg-amber-950/40 hover:border-amber-300 dark:hover:border-amber-700" },
                    { label: "Tenang", emoji: "🍃", hover: "hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700" },
                    { label: "Cemas", emoji: "☁️", hover: "hover:bg-blue-50/70 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700" },
                    { label: "Sedih", emoji: "🌧️", hover: "hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40 hover:border-cyan-300 dark:hover:border-cyan-700" },
                    { label: "Kesal", emoji: "⚡", hover: "hover:bg-rose-50/70 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-700" },
                    { label: "Lelah", emoji: "🔋", hover: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600" },
                  ].map((moodItem) => (
                    <button
                      key={moodItem.label}
                      onClick={() => handleQuickMood(moodItem.label, moodItem.emoji, 3)}
                      className={`p-3 bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer min-h-[76px] ${moodItem.hover}`}
                    >
                      <span className="text-2xl mb-1">{moodItem.emoji}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{moodItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Grid of CBT Modules (1 col on phone, 2 cols on tablet, 3 cols on laptop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Box 1: AI Talk */}
                <button
                  onClick={() => setView(AppView.CHAT)}
                  className="group text-left p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Terapi Bicara</span>
                      <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 rounded-xl flex items-center justify-center text-lg shrink-0">
                        💬
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        Teman Bicara (AI)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Curahkan keluh kesahmu tanpa prasangka bersama pendamping empatik VitLabs 24/7.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                    <span>Mulai Sesi</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Box 2: Reframing */}
                <button
                  onClick={() => setView(AppView.REFRAME)}
                  className="group text-left p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Latihan CBT</span>
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 rounded-xl flex items-center justify-center text-lg shrink-0">
                        🧠
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                        Reframing Pikiran
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Kenali distorsi kognitif dan susun ulang pola pikir negatif menjadi lebih objektif.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    <span>Urai Pikiran</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Box 3: Breathing */}
                <button
                  onClick={() => setView(AppView.BREATHING)}
                  className="group text-left p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Mindfulness</span>
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 rounded-xl flex items-center justify-center text-lg shrink-0">
                        🌊
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        Latihan Pernapasan
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Redakan kepanikan dan ketegangan saraf dengan panduan ritme Box Breathing & 4-7-8.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>Atur Napas</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Box 4: Mood Tracker */}
                <button
                  onClick={() => setView(AppView.MOOD)}
                  className="group text-left p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Regulasi Emosi</span>
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60 rounded-xl flex items-center justify-center text-lg shrink-0">
                        📊
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        Jurnal & Statistik Mood
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Catat intensitas emosi beserta faktor pemicunya untuk memahami pola harianmu.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <span>Buka Jurnal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Box 5: Gratitude */}
                <button
                  onClick={() => setView(AppView.GRATITUDE)}
                  className="group text-left p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-purple-400 dark:hover:border-purple-500 transition-all flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Apresiasi Diri</span>
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60 rounded-xl flex items-center justify-center text-lg shrink-0">
                        🌸
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                        Jurnal Rasa Syukur
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Dokumentasikan 3 hal baik setiap hari untuk membangun fokus pada hal-hal positif.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400">
                    <span>Tulis Syukur</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Box 6: History Vault */}
                <button
                  onClick={() => setView(AppView.HISTORY)}
                  className="group text-left p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Arsip Pribadi</span>
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-lg shrink-0">
                        🔑
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        Vault Riwayat CBT
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Tinjau kembali seluruh catatan mood, latihan reframing, dan jurnal syukurmu.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Lihat Arsip</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Crisis Resource Support Widget */}
              <div className="bg-red-50/80 dark:bg-red-950/35 p-4 sm:p-5 rounded-2xl border border-red-200/80 dark:border-red-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3.5 items-start">
                  <div className="bg-red-100 dark:bg-red-900/60 p-2.5 sm:p-3 rounded-xl text-red-700 dark:text-red-300 shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-900 dark:text-red-200">Sedang Butuh Bantuan Darurat Segera?</h3>
                    <p className="text-xs text-red-800/85 dark:text-red-300/85 leading-relaxed mt-0.5 max-w-xl">
                      Keselamatanmu adalah yang utama. Hubungi layanan konseling dan krisis darurat Kemenkes RI (SEJIWA) di 119 ext 8.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:119"
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center whitespace-nowrap shrink-0 shadow-xs active:scale-95"
                >
                  <span>Hubungi 119</span>
                </a>
              </div>

            </div>
          )}

          {/* ACTIVE MODULE VIEWS */}
          {view === AppView.CHAT && (
            <div className="h-[calc(100dvh-5.25rem)] md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)] min-h-[440px]">
              <ChatInterface />
            </div>
          )}

          {view === AppView.REFRAME && (
            <div className="pb-6 md:pb-0 md:min-h-[calc(100dvh-4rem)]">
              <ReframingTool />
            </div>
          )}

          {view === AppView.BREATHING && (
            <div className="pb-6 md:pb-0 md:min-h-[calc(100dvh-4rem)]">
              <BreathingTool />
            </div>
          )}

          {view === AppView.MOOD && (
            <div className="pb-6 md:pb-0 md:min-h-[calc(100dvh-4rem)]">
              <MoodTracker />
            </div>
          )}

          {view === AppView.GRATITUDE && (
            <div className="pb-6 md:pb-0 md:min-h-[calc(100dvh-4rem)]">
              <GratitudeJournal />
            </div>
          )}

          {view === AppView.HISTORY && (
            <div className="pb-6 md:pb-0 md:min-h-[calc(100dvh-4rem)]">
              <HistoryView />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
