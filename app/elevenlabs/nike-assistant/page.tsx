'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { VOICES } from '@/lib/voices';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioBase64?: string;
  mimeType?: string;
  suggestedActions?: SuggestedAction[];
}

interface SuggestedAction {
  id: string;
  label: string;
  type: 'cart' | 'compare' | 'alternative' | 'size' | 'info';
}

interface ShopperContext {
  size?: string;
}

const SIZES = ['US 6', 'US 6.5', 'US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 11.5', 'US 12', 'US 13'];

const PRODUCT_IMAGES = [
  '/images/nike-air-max.avif',
];

const PROMPT_CHIPS = [
  'Is this true to size?',
  'Good for wide feet?',
  'Best for what activity?',
  'Compare options',
];

export default function NikeAssistantPage() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartItems, setCartItems] = useState(0);
  const [showSizeError, setShowSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [shopperContext, setShopperContext] = useState<ShopperContext>({});
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setToast('Voice not supported');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/nike-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          selectedVoiceId: voiceId,
          shopperContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType,
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.updatedShopperContext) setShopperContext(data.updatedShopperContext);
      
      if (data.audioBase64 && audioRef.current) {
        audioRef.current.src = `data:${data.mimeType};base64,${data.audioBase64}`;
        audioRef.current.play().catch(() => {});
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: SuggestedAction) => {
    if (action.type === 'cart') {
      const sizeMatch = action.label.match(/size\s*(\d+(?:\.\d+)?)/i);
      if (sizeMatch) {
        setSelectedSize(`US ${sizeMatch[1]}`);
        handleAddToCart(`US ${sizeMatch[1]}`);
      }
    } else if (action.type === 'size') {
      const sizeMatch = action.label.match(/(\d+(?:\.\d+)?)/);
      if (sizeMatch) sendMessage(`I wear size ${sizeMatch[1]}`);
    } else {
      sendMessage(action.label);
    }
  };

  const handleAddToCart = (size?: string) => {
    const sizeToAdd = size || selectedSize;
    if (!sizeToAdd) {
      setShowSizeError(true);
      return;
    }
    setCartItems((prev) => prev + 1);
    setAddedToCart(true);
    setToast('Added to cart!');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const playAudio = (audioBase64: string, mimeType: string) => {
    if (audioRef.current) {
      audioRef.current.src = `data:${mimeType};base64,${audioBase64}`;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <audio ref={audioRef} className="hidden" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/elevenlabs/" className="text-xs text-gray-500 hover:text-black">
            ← Back to Demos
          </a>
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nike-logo.png"
              alt="Nike"
              className="h-8 w-auto"
            />
          </div>
          <button className="relative p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItems > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-orange-500 text-white text-center py-2 text-xs font-medium">
        DEMO: Voice Store Associate powered by ElevenLabs — Click the chat bubble to try it
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Product Images */}
          <div className="relative">
            {/* Main Image */}
            <div className="aspect-square bg-[#f5f5f5] relative overflow-hidden">
              <Image
                src={PRODUCT_IMAGES[selectedImage]}
                alt="Nike Air Max 90"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="px-4 py-6 lg:py-10 lg:pr-8">
            {/* Title & Price */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Men&apos;s Shoes</p>
              <h1 className="text-2xl lg:text-3xl font-medium text-black mb-2">Nike Air Max 90</h1>
              <p className="text-lg text-black">$140</p>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium">Select Size</span>
                <button className="text-sm text-gray-500 underline">Size Guide</button>
              </div>
              {showSizeError && !selectedSize && (
                <p className="text-red-600 text-sm mb-2">Please select a size</p>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                    className={`py-3 text-sm border rounded-md transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size.replace('US ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => handleAddToCart()}
              className={`w-full py-4 rounded-full text-base font-medium transition-all mb-4 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {addedToCart ? '✓ Added to Bag' : 'Add to Bag'}
            </button>

            <button className="w-full py-4 rounded-full text-base font-medium border border-gray-300 hover:border-black transition-colors mb-8">
              Favorite ♡
            </button>

            {/* Product Description */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Nothing as icons should be left satisfhat. Icons should be Icons a classic that brings out icons some icons of the past.
              </p>
              <p>
                The Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details. Classic colors celebrate your fresh look while Max Air cushioning adds comfort to your journey.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-medium mb-4">Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Originally designed for running, visible Nike Air cushioning puts the history of comfort beneath your feet.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Real and synthetic leather, plus textiles, add durability and support.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Rubber Waffle outsole delivers traction.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Foam midsole with Air-Sole unit for lightweight cushioning.
                </li>
              </ul>
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-medium mb-4">Product Details</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>Style: DV0036-001</li>
                <li>Color: Black/Volt/Anthracite/White</li>
                <li>Country/Region of Origin: Vietnam</li>
              </ul>
            </div>

            {/* Shipping */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div>
                  <p className="font-medium">Free Delivery and Returns</p>
                  <p className="text-gray-500">Standard delivery 4-9 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 lg:w-16 lg:h-16 bg-black rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-50 w-full lg:w-[380px] h-[85vh] lg:h-[550px] lg:max-h-[calc(100vh-100px)] bg-white lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-t lg:border border-gray-200">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-black text-white flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
              {VOICES.find(v => v.id === voiceId)?.name?.[0] || 'J'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm">{VOICES.find(v => v.id === voiceId)?.name || 'Jordan'}</h2>
              <p className="text-xs text-gray-300 truncate">Nike Store Associate</p>
            </div>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="text-xs bg-gray-800 border-0 rounded px-2 py-1 text-white focus:ring-0 max-w-[80px]"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <button onClick={() => setChatOpen(false)} className="p-1.5 hover:bg-gray-800 rounded-full ml-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium text-sm">Hey! I&apos;m {VOICES.find(v => v.id === voiceId)?.name || 'Jordan'}</p>
                <p className="text-gray-500 text-xs mt-1 mb-4 max-w-[220px] mx-auto">
                  Ask me anything about the Air Max 90 — sizing, fit, or what it&apos;s best for.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PROMPT_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="text-xs px-3 py-1.5 bg-white text-gray-700 rounded-full border border-gray-200 hover:border-black transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-black text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {message.role === 'assistant' && message.audioBase64 && (
                    <button
                      onClick={() => playAudio(message.audioBase64!, message.mimeType!)}
                      className="mt-1 text-xs text-gray-400 hover:text-black flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Replay
                    </button>
                  )}

                  {message.role === 'assistant' && message.suggestedActions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.suggestedActions.slice(0, 3).map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                            action.type === 'cart'
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-full flex-shrink-0 transition-colors ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this shoe..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-black text-white rounded-full disabled:opacity-40 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Spacer for mobile when chat is closed */}
      <div className="h-24 lg:h-0" />
    </div>
  );
}
