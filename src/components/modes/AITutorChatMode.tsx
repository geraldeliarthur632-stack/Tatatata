import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { GRADE_LABELS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import {
  ArrowLeft,
  Send,
  Camera,
  Mic,
  MicOff,
  MoreVertical,
  Trash2,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageBase64?: string;
  mimeType?: string;
  timestamp: number;
}

interface AITutorChatModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number) => void;
}

const STORAGE_CHAT_KEY = 'estudahud_ai_tutor_chat_history_v1';

export const AITutorChatMode: React.FC<AITutorChatModeProps> = ({
  user,
  onBack,
  onEarnPoints,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'user-demo-1',
        role: 'user',
        text: 'Não entendi como faz a fórmula de Bhaskara, pode explicar?',
        timestamp: Date.now() - 60000,
      },
      {
        id: 'model-demo-1',
        role: 'model',
        text:
          'Claro! A fórmula de Bhaskara é usada para encontrar as raízes da equação do 2º grau:\n' +
          'ax² + bx + c = 0, onde a ≠ 0.\n\n' +
          'A fórmula é:\n\n' +
          '$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n\n' +
          'Onde Δ = b² - 4ac\n' +
          'Posso te mostrar um exemplo?',
        timestamp: Date.now() - 40000,
      },
      {
        id: 'user-demo-2',
        role: 'user',
        text: 'Sim, por favor!',
        timestamp: Date.now() - 20000,
      },
      {
        id: 'model-demo-2',
        role: 'model',
        text:
          'Beleza! Vamos resolver essa equação:\n' +
          'x² + 5x + 6 = 0\n\n' +
          'Passo 1: Identificar os coeficientes:\n' +
          'a = 1, b = 5, c = 6\n\n' +
          'Passo 2: Calcular o discriminante (Delta):\n' +
          'Δ = 5² - 4(1)(6) = 25 - 24 = 1\n\n' +
          'Passo 3: Aplicar Bhaskara:\n' +
          'x = (-5 ± √1) / 2 = (-5 ± 1) / 2\n\n' +
          'Logo as raízes são:\n' +
          'x₁ = (-5 + 1)/2 = -2\n' +
          'x₂ = (-5 - 1)/2 = -3 ✨',
        timestamp: Date.now(),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech-to-text
  const toggleRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Interrompe qualquer narração ativa para liberar o microfone sem conflitos
    speechNarrator.stop();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        soundEffects.playClick();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_e) {
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    soundEffects.playClick();
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      imageBase64: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: user.grade,
          userName: user.name,
          message: textToSend,
          imageBase64: selectedImage || undefined,
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'model',
          text: data.text || 'Entendido! Como posso te ajudar a avançar no conteúdo?',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        onEarnPoints?.(5);
      } else {
        throw new Error('Falha na resposta do tutor');
      }
    } catch (_err) {
      const fallbackMsg: ChatMessage = {
        id: `msg_fallback_${Date.now()}`,
        role: 'model',
        text:
          'Ótima pergunta! Para resolver esse conceito passo a passo, observe a regra geral e tente substituir os valores com calma. Quer que eu detalhe mais algum termo?',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearHistory = () => {
    soundEffects.playClick();
    setMessages([
      {
        id: 'msg_welcome',
        role: 'model',
        text: `Olá, ${user.name || 'Estudante'}! 🎓 Em que posso te ajudar hoje?`,
        timestamp: Date.now(),
      },
    ]);
    setShowMenu(false);
  };

  // Render text with math formula styling
  const renderMessageContent = (text: string) => {
    // If it contains $$ math formula, format it nicely
    if (text.includes('$$')) {
      const parts = text.split('$$');
      return (
        <div className="space-y-2">
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return (
                <div
                  key={index}
                  className="my-2 p-3 bg-[#0b0f19] border border-[#273553] rounded-2xl flex items-center justify-center text-center shadow-inner"
                >
                  <span className="font-mono text-sm font-black text-[#c084fc] tracking-wider">
                    {part.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)').replace(/\\pm/g, '±').replace(/\\sqrt\{([^}]+)\}/g, '√($1)')}
                  </span>
                </div>
              );
            }
            return (
              <p key={index} className="whitespace-pre-line leading-relaxed">
                {part}
              </p>
            );
          })}
        </div>
      );
    }

    return <p className="whitespace-pre-line leading-relaxed">{text}</p>;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19] max-w-lg mx-auto w-full relative pb-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#1e293b] bg-[#0b0f19]/95 backdrop-blur sticky top-0 z-20">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-[#161e31] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#273553] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-sm">
            🤖
          </div>
          <span className="text-sm font-black text-white">Tutor IA</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl bg-[#161e31] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#273553] transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 bg-[#121829] border border-[#273553] rounded-2xl shadow-xl p-1.5 z-30 min-w-[140px]">
              <button
                onClick={handleClearHistory}
                className="w-full px-3 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs font-medium shadow-md transition-all relative group ${
                  isUser
                    ? 'bg-[#7c3aed] text-white rounded-br-xs'
                    : 'bg-[#121829] text-slate-200 border border-[#273553] rounded-bl-xs'
                }`}
              >
                {msg.imageBase64 && (
                  <img
                    src={msg.imageBase64}
                    alt="Foto enviada"
                    className="max-h-48 w-auto rounded-2xl mb-2 object-cover border border-white/20"
                  />
                )}
                {renderMessageContent(msg.text)}

                {/* Voice narration button for AI Tutor response */}
                {!isUser && (
                  <div className="mt-2 pt-1 border-t border-[#1e293b] flex items-center justify-between">
                    <button
                      onClick={() => {
                        const cleanText = msg.text.replace(/\[MATH\][\s\S]*?\[\/MATH\]/g, 'Fórmula matemática');
                        speechNarrator.speak(cleanText);
                      }}
                      className="text-[10px] text-slate-400 hover:text-[#c084fc] flex items-center gap-1 transition"
                      title="Ouvir explicação em voz alta"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Ouvir explicação</span>
                    </button>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tutor IA</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#121829] border border-[#273553] rounded-3xl rounded-bl-xs p-3.5 flex items-center gap-2 text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse delay-150" />
              <span className="ml-1 text-slate-400">Tutor pensando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            'Como fazer Bhaskara?',
            'Regras de concordância',
            'O que é fotossíntese?',
            'Como somar frações?',
            'Dicas para redação',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                soundEffects.playClick();
                handleSendMessage(suggestion);
              }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#161e31] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#273553] whitespace-nowrap shrink-0 transition active:scale-95"
            >
              💡 {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Selected Image Preview Pill */}
      {selectedImage && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Anexo"
              className="w-12 h-12 rounded-xl object-cover border border-[#8b5cf6]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Foto pronta para envio</span>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 bg-[#0b0f19] border-t border-[#1e293b]">
        <div className="flex items-center gap-2 bg-[#121829] border border-[#273553] focus-within:border-[#8b5cf6] rounded-full px-3 py-1.5 shadow-md">
          {/* Camera Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition"
            title="Tirar foto do caderno ou livro"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageCapture}
          />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite sua dúvida..."
            className="flex-1 bg-transparent text-white text-xs outline-hidden placeholder:text-slate-500 py-1"
          />

          {/* Mic Button */}
          <button
            onClick={toggleRecording}
            className={`p-1.5 rounded-full transition ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Comando por voz"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() && !selectedImage}
            className="p-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-40 text-white rounded-full transition shadow-sm"
            title="Enviar mensagem"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
