'use client';

import { useState, useRef } from 'react';
import { VOICES } from '@/lib/voices';
import type { Tone } from '@/lib/podcast';

interface PodcastResult {
  title: string;
  script: string;
  audioBase64: string;
  mimeType: string;
}

const TONES: { value: Tone; label: string }[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'documentary', label: 'Documentary' },
];

const EXAMPLE_URL = 'https://en.wikipedia.org/wiki/Artificial_intelligence';

export default function WikipodcastPage() {
  const [url, setUrl] = useState('');
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [tone, setTone] = useState<Tone>('neutral');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<PodcastResult | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a Wikipedia URL');
      return;
    }

    setLoading(true);
    setError('');
    setLoadingMessage('Validating Wikipedia URL...');

    try {
      setLoadingMessage('Fetching article content...');
      await new Promise((r) => setTimeout(r, 500));
      
      setLoadingMessage('Generating podcast script...');
      await new Promise((r) => setTimeout(r, 300));
      
      setLoadingMessage('Creating audio narration...');
      
      const response = await fetch('/api/wikipodcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), voiceId, tone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate podcast');
      }

      setResult(data);
      setShowScript(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleTryAnotherVoice = async () => {
    if (!result) return;
    
    const currentIndex = VOICES.findIndex((v) => v.id === voiceId);
    const nextIndex = (currentIndex + 1) % VOICES.length;
    const nextVoice = VOICES[nextIndex];
    
    setVoiceId(nextVoice.id);
    setLoading(true);
    setError('');
    setLoadingMessage(`Regenerating with ${nextVoice.name}...`);

    try {
      const response = await fetch('/api/wikipodcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), voiceId: nextVoice.id, tone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCopyScript = async () => {
    if (result?.script) {
      await navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = `data:${result.mimeType};base64,${result.audioBase64}`;
    link.download = `${result.title.replace(/\s+/g, '_')}_podcast.mp3`;
    link.click();
  };

  const audioSrc = result
    ? `data:${result.mimeType};base64,${result.audioBase64}`
    : undefined;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-[#a2a9b1]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href="/elevenlabs/"
            className="text-sm text-[#36c] hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Demos
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="/" className="text-[#36c] hover:underline">Home</a>
            <a href="/experience/" className="text-[#36c] hover:underline">Experience</a>
            <a href="/contact/" className="text-[#36c] hover:underline">Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center px-4 py-12">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-[2.75rem] md:text-[3.5rem] tracking-tight text-[#000] mb-3">
            WIKIPODCASTS
          </h1>
          <div className="inline-block bg-[#eaecf0] border border-[#a2a9b1] px-4 py-1.5 rounded-full text-sm text-[#54595d]">
            Turn Wikipedia into Audio
          </div>
        </div>

        {/* Microphone Icon */}
        <div className="my-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#eaecf0] via-[#c8ccd1] to-[#a2a9b1] flex items-center justify-center shadow-lg border border-[#c8ccd1]">
            <svg className="w-14 h-14 text-[#54595d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-[#54595d] max-w-lg mb-10 leading-relaxed text-base">
          Paste any Wikipedia article URL and receive a short, narrated audio briefing — perfect for learning on the go.
        </p>

        {/* Search/Input Section */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mb-6">
          {/* URL Input */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1 bg-white border-2 border-[#a2a9b1] rounded focus-within:border-[#36c] transition-all overflow-hidden">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://en.wikipedia.org/wiki/..."
                disabled={loading}
                className="w-full px-4 py-3.5 text-base bg-transparent outline-none placeholder-[#72777d] disabled:text-[#a2a9b1] disabled:bg-[#f8f9fa]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-8 py-3.5 bg-[#36c] text-white text-base font-semibold rounded hover:bg-[#2a4b8d] disabled:bg-[#c8ccd1] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Generate Podcast</span>
                </>
              )}
            </button>
          </div>

          {/* Voice and Tone Selectors */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <div className="flex-1">
              <label className="block text-xs text-[#72777d] mb-1.5 uppercase tracking-wide font-medium">Voice</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 text-sm bg-white border-2 border-[#a2a9b1] rounded focus:outline-none focus:border-[#36c] disabled:bg-[#f8f9fa] disabled:text-[#a2a9b1] cursor-pointer"
              >
                {VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#72777d] mb-1.5 uppercase tracking-wide font-medium">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                disabled={loading}
                className="w-full px-3 py-2.5 text-sm bg-white border-2 border-[#a2a9b1] rounded focus:outline-none focus:border-[#36c] disabled:bg-[#f8f9fa] disabled:text-[#a2a9b1] cursor-pointer"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Helper Text */}
        <p className="text-xs text-[#72777d] text-center mb-10">
          Best results come from standard article pages. Avoid category, file, or special pages.
        </p>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border-2 border-[#a2a9b1] rounded p-10 w-full max-w-xl text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#36c] border-t-transparent rounded-full animate-spin mb-5" />
            <p className="text-[#54595d] text-lg">{loadingMessage}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-[#fee7e6] border-2 border-[#d33] rounded p-5 w-full max-w-xl mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#d33] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-[#d33]">{error}</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <div className="bg-white border-2 border-[#a2a9b1] rounded w-full max-w-xl overflow-hidden">
            {/* Result Header */}
            <div className="bg-[#eaecf0] border-b-2 border-[#a2a9b1] px-6 py-4">
              <h2 className="font-serif text-2xl text-[#000]">{result.title}</h2>
            </div>

            {/* Audio Player */}
            <div className="p-6">
              <audio
                ref={audioRef}
                src={audioSrc}
                controls
                className="w-full mb-6"
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#36c] text-white rounded hover:bg-[#2a4b8d] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download MP3
                </button>
                <button
                  onClick={handleTryAnotherVoice}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-2 border-[#a2a9b1] text-[#36c] rounded hover:bg-[#f8f9fa] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Another Voice
                </button>
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-2 border-[#a2a9b1] text-[#36c] rounded hover:bg-[#f8f9fa] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {showScript ? 'Hide Script' : 'View Script'}
                </button>
              </div>
            </div>

            {/* Script Preview (Collapsible) */}
            {showScript && (
              <div className="border-t-2 border-[#a2a9b1] bg-[#f8f9fa] px-6 py-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-[#54595d]">Generated Script</span>
                  <button
                    onClick={handleCopyScript}
                    className="text-sm text-[#36c] hover:underline flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-[#202122] leading-relaxed whitespace-pre-wrap bg-white border-2 border-[#c8ccd1] rounded p-4">
                  {result.script}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="bg-white border-2 border-[#a2a9b1] rounded p-10 w-full max-w-xl text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#eaecf0] flex items-center justify-center border border-[#c8ccd1]">
              <svg className="w-10 h-10 text-[#72777d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-[#54595d] mb-5 text-base">
              Enter a Wikipedia URL above to generate your first podcast.
            </p>
            <button
              onClick={() => setUrl(EXAMPLE_URL)}
              className="inline-flex items-center gap-2 text-[#36c] hover:underline font-medium"
            >
              Try an example: Artificial Intelligence
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#a2a9b1] bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-center text-sm text-[#72777d]">
            Demo powered by <span className="font-medium">ElevenLabs</span> text-to-speech. Audio is generated on-demand and not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
