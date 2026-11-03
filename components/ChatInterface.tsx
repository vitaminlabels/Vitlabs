import React, { useState, useEffect, useRef } from 'react';
import { Sender, ChatMessage } from '../types';
import { sendMessageToAI, initializeChat } from '../services/geminiService';
import CrisisAlert from './CrisisAlert';
import { 
  Send, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  HeartHandshake
} from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    const username = localStorage.getItem('vitlabs_user_name') || localStorage.getItem('temansejiwa_user_name') || 'Sahabat';
    setMessages([{
      id: 'init',
      role: Sender.AI,
      text: `Halo, Kak ${username}... 🌿 Aku VitLabs. Aku di sini siap mendengarkan cerita kamu dengan hangat, rahasia, dan seutuhnya. Apa yang sedang membebani pikiranmu hari ini?`
    }]);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Sender.USER,
      text: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: Sender.AI,
        text: response.text,
        isCrisisResponse: response.isCrisis
      };

      setMessages(prev => [...prev, aiMsg]);

      if (response.isCrisis) {
        setShowCrisisAlert(true);
      }

    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeechUnsupported(true);
      setTimeout(() => setSpeechUnsupported(false), 3500);
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; 
    utterance.pitch = 1.15; 
    utterance.rate = 0.96;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang === 'id-ID' && v.name.includes('Google'));
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'id-ID');
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('indonesia'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-800 dark:to-emerald-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex justify-between items-center gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg sm:text-xl border border-white/15 shrink-0">
            💬
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base truncate">
              Teman Bicara VitLabs (AI)
            </h2>
            <p className="text-[11px] text-teal-100 font-medium flex items-center gap-1 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-200 shrink-0" />
              <span>Sesi Rahasia Lokal · Privat</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-teal-50 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
          <span>Siap Mendengar</span>
        </div>
      </div>

      {/* Speech warning banner if unsupported */}
      {speechUnsupported && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/70 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 font-medium text-center">
          Peramban perangkat ini belum mendukung fitur pembaca suara otomatis.
        </div>
      )}

      {/* Message Feed Section */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {showCrisisAlert && <CrisisAlert onDismiss={() => setShowCrisisAlert(false)} />}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === Sender.USER ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div className={`flex items-end gap-2 sm:gap-2.5 max-w-[92%] sm:max-w-[82%] lg:max-w-[75%] ${msg.role === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar indicator for AI */}
              {msg.role === Sender.AI && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 rounded-lg flex items-center justify-center text-xs shrink-0">
                  🌱
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 sm:p-4 text-xs sm:text-sm leading-relaxed break-words ${
                  msg.role === Sender.USER
                    ? 'bg-teal-600 text-white rounded-tr-xs font-medium shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs font-medium shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Speaker controller for AI */}
              {msg.role === Sender.AI && (
                <button
                  onClick={() => handleSpeak(msg.text, msg.id)}
                  className={`p-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                    speakingId === msg.id 
                      ? 'bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 ring-2 ring-teal-400' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                  }`}
                  title={speakingId === msg.id ? "Berhenti bicara" : "Dengarkan suara VitLabs"}
                  aria-label={speakingId === msg.id ? "Berhenti bicara" : "Dengarkan pesan"}
                >
                  {speakingId === msg.id ? (
                    <VolumeX className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 rounded-lg flex items-center justify-center text-xs shrink-0">
              🌱
            </div>
            <div className="bg-white dark:bg-slate-800 px-4 py-3.5 rounded-2xl rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex space-x-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Messaging Input Area */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0 transition-colors">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik ceritamu pelan-pelan di sini..."
            className="flex-1 px-3.5 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 max-h-32"
            rows={1}
            style={{ minHeight: '46px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-[46px] px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm shrink-0 cursor-pointer"
            aria-label="Kirim pesan"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center justify-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>VitLabs siap mendengarkan. Sesi ini berjalan secara privat dan aman.</span>
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
