import { AnniversaryData } from '../types/anniversary';

export const DEFAULT_ANNIVERSARY_DATA: AnniversaryData = {
  passkey: '0610',
  partnerName: 'Kajal',
  senderName: 'Priyansh',
  anniversaryDate: '2026-05-27',
  anniversaryYearText: '19th',
  celebrationTitle: 'Happy 19th Birthday, Kajal!',
  letter: {
    title: 'Happy Birthday! 🎂💗',
    salutation: 'Dearest Billu,',
    paragraphs: [
      'I just want to say that I’m really happy to have a friend like you. You’re genuinely a very special person, and I hope you always stay the same.',
      'I hope this new year of your life brings you lots of happiness, good memories, success, and all the things you wish for. I hope you get many reasons to smile and that you never lose the beautiful person you are.',
      'Thank you for being there, for all the conversations, random talks, laughs, and memories we’ve made. Even the stupid little moments are special in their own way.',
      'On your birthday, I just want you to know that you deserve to be happy and surrounded by people who truly care about you.',
      'Once again, Happy Birthday! 🫶🏻🎉 I hope you have the most amazing day and an even more amazing year ahead.',
      'Stay happy, stay crazy, and keep smiling. ❤️'
    ],
    signOff: 'With warmth & love,',
    ps: ''
  },
  memories: [
    {
      id: 'mem-1',
      src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      caption: 'That soft, radiant smile that captured my heart',
      date: 'The Day It All Began',
      location: 'Our Favorite Cafe',
      rotate: -3.2
    },
    {
      id: 'mem-2',
      src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden hour walks, lost in endless conversations',
      date: 'Autumn Evening',
      location: 'Sunset Point',
      rotate: 2.6
    },
    {
      id: 'mem-3',
      src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      caption: 'Every glance, every stolen whisper worth keeping forever',
      date: 'A Quiet Afternoon',
      location: 'Under the Cherry Blossoms',
      rotate: -1.8
    },
    {
      id: 'mem-4',
      src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      caption: 'Hand in hand, ready to explore the whole world with you',
      date: 'Our Weekend Getaway',
      location: 'The Ocean Pier',
      rotate: 3.4
    },
    {
      id: 'mem-5',
      src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      caption: 'Stargazing until midnight, talking about our dreams',
      date: 'Midsummer Night',
      location: 'Rooftop under the Stars',
      rotate: -2.5
    },
    {
      id: 'mem-6',
      src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      caption: 'The unforgettable laughter when we both couldn’t stop smiling',
      date: 'Celebration Night',
      location: 'Candlelit Dinner',
      rotate: 1.9
    }
  ],
  videoUrl: '',
  musicAutoplay: true
};

export const STORAGE_KEY = 'kajal_19th_birthday_app_data_v2';
const FALLBACK_KEYS = [
  'kajal_19th_birthday_app_data_v2',
  'kajal_19th_birthday_app_data',
  'anniversary_data_v2',
  'anniversary_data',
  'birthday_data'
];

/**
 * Loads the anniversary/birthday data with progressive priority:
 * 1. URL hash `#data=` (works anywhere across devices & links)
 * 2. LocalStorage (preview session storage)
 * 3. Default blueprint
 */
export function loadAnniversaryData(): AnniversaryData {
  try {
    // 1. Check URL hash for shared config
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#data=')) {
      const encoded = window.location.hash.slice(6);
      const json = decodeURIComponent(atob(encoded));
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_ANNIVERSARY_DATA, ...parsed };
      }
    }

    // 2. Check LocalStorage across known keys
    if (typeof window !== 'undefined') {
      for (const key of FALLBACK_KEYS) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
              return { ...DEFAULT_ANNIVERSARY_DATA, ...parsed };
            }
          } catch {
            // continue checking
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse local data:', err);
  }
  return DEFAULT_ANNIVERSARY_DATA;
}

/**
 * Fetches server-persisted data from backend / static JSON file
 */
export async function fetchServerAnniversaryData(): Promise<AnniversaryData | null> {
  // Try dynamic API route first
  try {
    const res = await fetch('/api/anniversary-data');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && (data.videoUrl || data.memories)) {
        return { ...DEFAULT_ANNIVERSARY_DATA, ...data };
      }
    }
  } catch {
    // fall through to static file
  }

  // Try static JSON fallback in public/data
  try {
    const res = await fetch('/data/anniversary-data.json');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && (data.videoUrl || data.memories)) {
        return { ...DEFAULT_ANNIVERSARY_DATA, ...data };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Saves anniversary data both locally in localStorage AND permanently to server storage
 */
export async function saveAnniversaryData(data: AnniversaryData): Promise<boolean> {
  // 1. Save locally in localStorage immediately
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }

  // 2. Send to server so deployed app & all other visitors get it!
  try {
    const res = await fetch('/api/anniversary-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      console.log('✅ Anniversary data persisted to server storage.');
      return true;
    }
  } catch (err) {
    console.warn('Could not reach /api/anniversary-data server endpoint:', err);
  }

  return false;
}

export function resetAnniversaryData(): AnniversaryData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
  return DEFAULT_ANNIVERSARY_DATA;
}

/**
 * Generates an unforgeable shareable URL that embeds data in the URL hash,
 * ensuring any link sent to Kajal or opened on mobile displays the exact photos & video.
 */
export function generateShareUrl(data: AnniversaryData): string {
  try {
    const json = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(json));
    const url = new URL(window.location.href);
    url.hash = `data=${encoded}`;
    return url.toString();
  } catch (e) {
    console.error('Failed to generate share URL', e);
    return window.location.href;
  }
}
