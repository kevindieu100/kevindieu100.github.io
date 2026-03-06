export interface WikipediaArticle {
  title: string;
  summary: string;
  content: string;
}

export interface WikipediaError {
  error: string;
}

export type WikipediaResult = WikipediaArticle | WikipediaError;

const INVALID_NAMESPACES = [
  'Category:',
  'File:',
  'Help:',
  'Special:',
  'Template:',
  'Wikipedia:',
  'Portal:',
  'Draft:',
  'Module:',
  'MediaWiki:',
  'Talk:',
  'User:',
  'User_talk:',
];

export function validateWikipediaUrl(url: string): { valid: boolean; error?: string; title?: string } {
  try {
    const parsed = new URL(url);
    
    // Check domain
    if (!parsed.hostname.endsWith('wikipedia.org')) {
      return { valid: false, error: 'URL must be from wikipedia.org' };
    }

    // Check path format
    const pathMatch = parsed.pathname.match(/^\/wiki\/(.+)$/);
    if (!pathMatch) {
      return { valid: false, error: 'URL must be a Wikipedia article (e.g., /wiki/Article_Name)' };
    }

    const titleSlug = decodeURIComponent(pathMatch[1]);

    // Check for invalid namespaces
    for (const ns of INVALID_NAMESPACES) {
      if (titleSlug.startsWith(ns)) {
        return { valid: false, error: `Cannot generate podcast from ${ns.replace(':', '')} pages` };
      }
    }

    // Check for edit/history pages
    if (parsed.searchParams.has('action') || parsed.searchParams.has('oldid')) {
      return { valid: false, error: 'Cannot generate podcast from edit or history pages' };
    }

    return { valid: true, title: titleSlug };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

function cleanText(text: string): string {
  return text
    // Remove citation markers like [1], [12], [citation needed]
    .replace(/\[\d+\]/g, '')
    .replace(/\[citation needed\]/gi, '')
    .replace(/\[clarification needed\]/gi, '')
    .replace(/\[.*?\]/g, '')
    // Remove parenthetical pronunciations
    .replace(/\([^)]*pronunciation[^)]*\)/gi, '')
    .replace(/\(listen\)/gi, '')
    // Remove IPA transcriptions
    .replace(/\/[^/]+\//g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .trim();
}

export async function fetchWikipediaArticle(titleSlug: string): Promise<WikipediaResult> {
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titleSlug)}`;
  
  try {
    const summaryResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'WikipodcastDemo/1.0 (https://github.com/example)',
      },
    });

    if (!summaryResponse.ok) {
      if (summaryResponse.status === 404) {
        return { error: 'Wikipedia article not found' };
      }
      return { error: `Failed to fetch article: ${summaryResponse.status}` };
    }

    const summaryData = await summaryResponse.json();
    
    // Also fetch the full extract for more content
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titleSlug)}&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain&format=json&origin=*`;
    
    const extractResponse = await fetch(extractUrl, {
      headers: {
        'User-Agent': 'WikipodcastDemo/1.0 (https://github.com/example)',
      },
    });

    let fullContent = summaryData.extract || '';
    
    if (extractResponse.ok) {
      const extractData = await extractResponse.json();
      const pages = extractData.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId && pageId !== '-1' && pages[pageId].extract) {
          fullContent = pages[pageId].extract;
        }
      }
    }

    const cleanedContent = cleanText(fullContent);
    const cleanedSummary = cleanText(summaryData.extract || '');

    return {
      title: summaryData.title || titleSlug.replace(/_/g, ' '),
      summary: cleanedSummary,
      content: cleanedContent,
    };
  } catch (err) {
    console.error('Wikipedia fetch error:', err);
    return { error: 'Failed to connect to Wikipedia API' };
  }
}
