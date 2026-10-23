import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, X, Bot, User, ArrowRight, MessageSquare, 
  Trash2, ChevronDown, ChevronUp, ShoppingBag, Zap
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const QUICK_PROMPTS = [
  '🔥 Show Mega Discounts',
  '📱 Best phones under ₹30,000',
  '👟 Top rated luxury footwear',
  '🎧 Noise cancelling wireless audio',
  '💻 Premium ultrabooks for work'
];

export default function StickyGlassAIAssistant({ onSelectProduct }) {
  const { user, token } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to E-Shop Concierge ${user?.name ? user.name.split(' ')[0] : ''}! ✨ I am your personal shopping advisor. Ask me anything from *"luxury smartphones"* to *"hoodies with 40%+ discount"*, and I will curate the best options for you.`,
      productRecommendations: [],
      followUpQuestions: [
        '👟 Trending Sneakers & Kicks',
        '📱 5G Flagship Smartphones',
        '💻 MacBook Air & Gaming Laptops',
        '🔥 Mega Discounts (40%+ OFF)'
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      role: 'user',
      content: textToSend.trim(),
      productRecommendations: []
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    if (!isExpanded) setIsExpanded(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const guestSessionId = (() => {
        let gid = localStorage.getItem('eshop_guest_session_id');
        if (!gid) {
          gid = 'guest_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
          localStorage.setItem('eshop_guest_session_id', gid);
        }
        return gid;
      })();

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend.trim(),
          sessionId: user?._id ? `user-${user._id}` : guestSessionId
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.data.reply,
            productRecommendations: data.data.productRecommendations || [],
            followUpQuestions: data.data.followUpQuestions || []
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "I couldn't fetch recommendations right now. Please try a different query.",
            productRecommendations: [],
            followUpQuestions: []
          }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I ran into a network error. Please try again.",
          productRecommendations: [],
          followUpQuestions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared! How may I assist your shopping today?`,
        productRecommendations: [],
        followUpQuestions: [
          '👟 Luxury Sneakers & Streetwear',
          '📱 Flagship 5G Mobiles',
          '💻 High Performance Laptops',
          '🎧 Wireless Noise Canceling Audio'
        ]
      }
    ]);
  };

  return (
    <>
      {/* 1. EXPANDED CONVERSATION FLYOUT PANEL */}
      {isExpanded && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-xl bg-[#FFFFFF] border border-[#B8935A]/40 rounded-[12px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[580px] animate-scale-up font-sans text-[#1F2421]">
          {/* Header */}
          <div className="p-4 border-b border-[#B8935A]/25 bg-[#1E3A34] text-[#FAF6EF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#C2603F] flex items-center justify-center text-white shadow-sm font-bold">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#FAF6EF] flex items-center gap-2">
                  AI Haute Concierge
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-[4px] bg-[#B8935A] text-[#142922] font-bold">
                    Active
                  </span>
                </h3>
                <p className="text-[10px] text-[#FAF6EF]/75 font-sans">Real-time intelligent catalog matching</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 text-[#FAF6EF]/70 hover:text-white hover:bg-[#2A524A] rounded-[4px] transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-[#FAF6EF]/70 hover:text-white hover:bg-[#2A524A] rounded-[4px] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[360px] min-h-[220px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-[4px] bg-[#1E3A34] text-[#FAF6EF] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] p-3.5 rounded-[8px] ${
                    msg.role === 'user'
                      ? 'bg-[#C2603F] text-white font-medium rounded-tr-none shadow-sm'
                      : 'bg-[#FAF6EF] text-[#1F2421] rounded-tl-none border border-[#E7DFD2] shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.content}</p>

                  {/* Direct Clickable Product Cards Inside Chat */}
                  {msg.productRecommendations?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E7DFD2] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#1E3A34] block font-sans flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#B8935A]" />
                          Recommended Curations ({msg.productRecommendations.length}):
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.productRecommendations.map((prod) => (
                          <div
                            key={prod.productId || prod._id}
                            onClick={() => onSelectProduct(prod)}
                            className="flex flex-col p-2.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#FAF6EF] border border-[#E7DFD2] hover:border-[#B8935A] cursor-pointer transition-all group shadow-sm"
                          >
                            {/* Recommended Badge & Discount Tag */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-[9px] font-bold text-[#1E3A34] bg-[#FAF6EF] border border-[#B8935A]/40 px-1.5 py-0.5 rounded-[4px] font-sans flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-2.5 h-2.5 text-[#B8935A]" />
                                {prod.recommendationBadge || '⭐ Recommended'}
                              </span>
                              {prod.discountPercent > 0 && (
                                <span className="text-[9px] font-bold text-white bg-[#A63D2F] px-1.5 py-0.5 rounded-[4px] font-sans">
                                  {prod.discountPercent}% OFF
                                </span>
                              )}
                            </div>

                            {/* Product Info Row */}
                            <div className="flex items-start gap-2.5">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-12 h-12 rounded-[4px] object-contain bg-[#FAF6EF] p-1 border border-[#E7DFD2] shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#1F2421] truncate group-hover:text-[#1E3A34] text-xs">
                                  {prod.name}
                                </p>
                                {prod.recommendedReason && (
                                  <p className="text-[10px] text-[#6B665E] font-medium line-clamp-2 mt-0.5 leading-snug">
                                    {prod.recommendedReason}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Price & Action Row */}
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#E7DFD2]">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-sans font-bold text-[#1F2421] text-xs tabular-nums">
                                  ₹{prod.price?.toLocaleString()}
                                </span>
                                {prod.originalPrice > prod.price && (
                                  <span className="text-[10px] line-through text-[#6B665E] font-sans tabular-nums">
                                    ₹{prod.originalPrice?.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#C2603F] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                View <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Clarifying Follow-up Questions / Suggestions */}
                  {msg.followUpQuestions?.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#E7DFD2] space-y-1.5">
                      <span className="text-[10px] font-bold tracking-wider text-[#1E3A34] uppercase font-sans flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#B8935A]" />
                        <span>Clarify or narrow down your request:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(q)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#FAF6EF] text-[#1F2421] hover:text-[#1E3A34] border border-[#E7DFD2] hover:border-[#B8935A] transition-all text-left shadow-sm cursor-pointer active:scale-95"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-[4px] bg-[#FAF6EF] text-[#1E3A34] border border-[#E7DFD2] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#1E3A34] p-2">
                <div className="w-3.5 h-3.5 border-2 border-[#1E3A34] border-t-transparent rounded-full animate-spin" />
                <span>Concierge is searching the luxury catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2.5 bg-[#FAF6EF] border-t border-[#E7DFD2] flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF6EF] text-[#6B665E] hover:text-[#1E3A34] border border-[#E7DFD2] hover:border-[#B8935A] transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. THE SINGLE UNIFIED STICKY FLOATING GLASS SEARCH BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-xl font-sans">
        <div className="relative group">
          {/* Subtle Warm Glow */}
          <div className={`absolute -inset-1 bg-[#B8935A]/20 rounded-full blur-md transition duration-500 ${
            isExpanded ? 'opacity-75' : 'opacity-40 group-hover:opacity-75'
          }`} />

          {/* Glass Bar Container with .ai-search token */}
          <div className={`ai-search relative flex items-center gap-2 px-3 py-2 shadow-2xl transition-all ${
            isExpanded 
              ? 'ring-1 ring-[#B8935A]' 
              : 'hover:border-[#B8935A]'
          }`}>
            {/* Sparkles Icon Toggle */}
            <button
              onClick={() => {
                const nextState = !isExpanded;
                setIsExpanded(nextState);
                if (nextState) {
                  setTimeout(() => inputRef.current?.focus(), 50);
                }
              }}
              className="p-2 rounded-full bg-[#C2603F] hover:bg-[#A44E31] text-white shadow-sm hover:scale-105 active:scale-95 transition-transform shrink-0 font-bold cursor-pointer"
              title={isExpanded ? 'Collapse Concierge' : 'Expand Concierge'}
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* The Sole Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onFocus={() => {
                  if (!isExpanded) setIsExpanded(true);
                }}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask AI Shopping Concierge (e.g. 'smartphones under 30000', 'best gym shoes')..."
                className="w-full bg-transparent px-2 text-xs md:text-sm text-[#1F2421] placeholder-[#6B665E] focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2 rounded-full text-[#C2603F] hover:text-[#A44E31] hover:bg-white/60 disabled:opacity-30 transition-all shrink-0 cursor-pointer"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => {
                const nextState = !isExpanded;
                setIsExpanded(nextState);
                if (nextState) {
                  setTimeout(() => inputRef.current?.focus(), 50);
                }
              }}
              className="p-2 text-[#6B665E] hover:text-[#1F2421] hover:bg-white/60 rounded-full transition-colors shrink-0 cursor-pointer"
              title={isExpanded ? 'Collapse Concierge' : 'Expand Concierge'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
