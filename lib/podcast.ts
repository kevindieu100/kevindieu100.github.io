import { WikipediaArticle } from './wikipedia';

export type Tone = 'neutral' | 'energetic' | 'documentary';

interface ScriptOptions {
  article: WikipediaArticle;
  tone: Tone;
}

const TONE_HOOKS: Record<Tone, string[]> = {
  neutral: [
    'Today, we explore',
    'Let me tell you about',
    'Here\'s the story of',
  ],
  energetic: [
    'Get ready to discover',
    'You won\'t believe the fascinating story of',
    'Buckle up as we dive into',
  ],
  documentary: [
    'In the annals of history, few subjects are as compelling as',
    'Throughout time, humanity has been fascinated by',
    'Our journey today takes us to explore',
  ],
};

const TONE_TRANSITIONS: Record<Tone, string[]> = {
  neutral: [
    'Essentially,',
    'In other words,',
    'To put it simply,',
  ],
  energetic: [
    'And here\'s where it gets interesting:',
    'But wait, there\'s more!',
    'The really cool part is that',
  ],
  documentary: [
    'Upon closer examination,',
    'Historical records reveal that',
    'Scholars have noted that',
  ],
};

const TONE_CLOSINGS: Record<Tone, string[]> = {
  neutral: [
    'And that\'s the essence of',
    'So that\'s a quick look at',
    'In summary, that\'s',
  ],
  energetic: [
    'Pretty amazing, right? That was',
    'How cool is that? You just learned about',
    'And there you have it, the incredible story of',
  ],
  documentary: [
    'Thus concludes our exploration of',
    'And so, the story of',
    'This has been an examination of',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  
  const truncated = words.slice(0, maxWords).join(' ');
  const lastPeriod = truncated.lastIndexOf('.');
  
  if (lastPeriod > truncated.length * 0.5) {
    return truncated.slice(0, lastPeriod + 1);
  }
  return truncated + '.';
}

function extractKeyPoints(content: string, maxSentences: number = 6): string[] {
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20 && s.length < 300)
    .filter((s) => !s.includes('==')) // Remove section headers
    .filter((s) => !/^\d+$/.test(s.trim())); // Remove standalone numbers

  return sentences.slice(0, maxSentences);
}

export function generatePodcastScript({ article, tone }: ScriptOptions): string {
  const { title, summary } = article;
  
  const hook = pickRandom(TONE_HOOKS[tone]);
  const closing = pickRandom(TONE_CLOSINGS[tone]);

  // Build a short 30-second script (~75 words, ~400 characters)
  const parts: string[] = [];

  // Opening hook with title
  parts.push(`${hook} ${title}.`);
  
  // Use just the first part of the summary
  if (summary && summary.length > 30) {
    const shortSummary = truncateToWordLimit(summary, 45);
    parts.push(shortSummary);
  }

  // Quick closing
  parts.push(`${closing} ${title}.`);

  // Join and enforce word limit (target: ~75 words for 30 second audio)
  const rawScript = parts.join(' ');
  const finalScript = truncateToWordLimit(rawScript, 75);

  return finalScript;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function estimateDuration(wordCount: number): number {
  // Average speaking rate: ~150 words per minute
  return Math.round((wordCount / 150) * 60);
}
