import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../i18n';
import type { Language, ChatMessage } from '../../types';
import { chatAboutForm, offlineFallback } from '../../ai/aiAdapter';

interface ChatViewProps {
  language: Language;
  darkMode: boolean;
  currentFieldLabel?: string;
  onBack: () => void;
}

const SUGGESTED: Record<Language, string[]> = {
  en: ['What documents do I need?', 'What is a Gazetted Officer?', 'What does self-attested mean?'],
  hi: ['मुझे कौन से दस्तावेज़ चाहिए?', 'राजपत्रित अधिकारी कौन होता है?', 'स्व-अभिप्रमाणित का मतलब क्या है?'],
  ta: ['எனக்கு என்ன ஆவணங்கள் தேவை?', 'அரசியதிகாரி யார்?', 'சுய-சான்றிதழ் என்றால் என்ன?'],
};

export default function ChatView({ language, darkMode, currentFieldLabel, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: language === 'hi'
        ? 'नमस्ते! इस फ़ॉर्म के बारे में कुछ भी पूछें।'
        : language === 'ta'
        ? 'வணக்கம்! இந்த படிவத்தைப் பற்றி எதையும் கேளுங்கள்.'
        : 'Hi! Ask me anything about this form.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = darkMode ? '#FAFAFA' : '#09090B';
  const muted = darkMode ? '#A1A1AA' : '#71717A';
  const surface2 = darkMode ? '#27272A' : '#F7F7F9';
  const border = darkMode ? '#3F3F46' : '#E5E5EA';
  const surface = darkMode ? '#18181B' : '#FFFFFF';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: question, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatAboutForm(question, currentFieldLabel ?? '', document.title, language);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply.answer,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fb = offlineFallback(currentFieldLabel ?? 'this field', language);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fb.plain,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#5B5BD6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>S</div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? '#5B5BD6' : surface2,
              color: msg.role === 'user' ? '#fff' : text,
              fontSize: '14px',
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#5B5BD6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>S</div>
            <div style={{ padding: '10px 14px', background: surface2, borderRadius: '12px 12px 12px 2px' }}>
              <span style={{ color: muted }}>···</span>
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {messages.length <= 1 && !loading && (
          <div>
            <p style={{ fontSize: '11px', color: muted, marginBottom: '8px', fontWeight: 600 }}>
              {language === 'hi' ? 'ये भी पूछ सकते हैं' : language === 'ta' ? 'இவற்றையும் கேளுங்கள்' : 'You could also ask'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SUGGESTED[language].map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{ padding: '8px 12px', border: `1px solid ${border}`, borderRadius: '8px', background: surface, color: text, fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input footer */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${border}`, background: surface }}>
        <p style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>
          {language === 'hi'
            ? 'आपके फ़ॉर्म में भरी जानकारी कभी नहीं भेजी जाती।'
            : language === 'ta'
            ? 'நீங்கள் நிரப்பும் தகவல் எங்களுக்கு அனுப்பப்படாது.'
            : 'What you type into the form is never sent to us.'}
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', border: `1px solid ${border}`, borderRadius: '8px', padding: '0 8px', background: surface2 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={t(language, 'chatPlaceholder')}
            aria-label={t(language, 'chatPlaceholder')}
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 8px', fontSize: '14px', color: text, fontFamily: 'inherit', outline: 'none' }}
          />
          <button onClick={() => sendMessage(input)} aria-label={t(language, 'sendButton')}
            style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#5B5BD6', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
