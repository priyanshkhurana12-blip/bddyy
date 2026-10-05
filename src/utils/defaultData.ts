import { AnniversaryData } from '../types/anniversary';

export const DEFAULT_ANNIVERSARY_DATA: AnniversaryData = {
  passkey: '0610',
  partnerName: 'Kajal',
  senderName: 'Priyansh',
  anniversaryDate: '2026-05-27', // Stated from May 27, 2026
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
      src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      caption: 'Since 5th Class (9 Long Years)',
      date: 'Nine Years of Feelings',
      location: 'Where Our Story Began',
      rotate: -3.2
    },
    {
      id: 'mem-2',
      src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      caption: '132 Magical Days of This Special Bond',
      date: 'Our Unbreakable Chapter',
      location: 'Every Sweet Conversation',
      rotate: 2.6
    },
    {
      id: 'mem-3',
      src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      caption: 'Each Other’s Counterparts & Safe Space',
      date: 'Daily Life & Random Talks',
      location: 'Laughing Through Ups & Downs',
      rotate: -1.8
    },
    {
      id: 'mem-4',
      src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      caption: 'Making You Smile Whenever You’re Sad',
      date: 'Pure Smiles',
      location: 'Our Favorite Memories',
      rotate: 3.4
    },
    {
      id: 'mem-5',
      src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: 'Mutual Understanding & Dreams of Traveling the World',
      date: 'Always By Your Side',
      location: 'Under the Stars',
      rotate: -2.5
    },
    {
      id: 'mem-6',
      src: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      caption: 'Stay Happy, Stay Crazy — Tu Aisi Hi Theek Hai ❤️',
      date: 'Happy 19th Birthday Billu',
      location: 'Forever Cherished',
      rotate: 1.9
    }
  ],
  reasons: [
    {
      id: 'reason-1',
      emoji: '✨',
      title: 'Your Contagious Warmth',
      description: 'The way your eyes light up when you smile, making every gloomy room instantly bright and cozy.'
    },
    {
      id: 'reason-2',
      emoji: '☕',
      title: 'Our Sweet Little Rituals',
      description: 'From sharing morning coffee to our favorite inside jokes that nobody else in the world understands.'
    },
    {
      id: 'reason-3',
      emoji: '🛡️',
      title: 'You Are My Safe Harbor',
      description: 'No matter how chaotic the world gets, wrapping my arms around you brings instant peace and home.'
    },
    {
      id: 'reason-4',
      emoji: '🌟',
      title: 'The Way You Believe In Me',
      description: 'You give me courage when I doubt myself and celebrate my smallest wins with the biggest heart.'
    },
    {
      id: 'reason-5',
      emoji: '🌙',
      title: 'Late Night Heart-to-Hearts',
      description: 'Those conversations where time stands still and souls connect in a way words can barely describe.'
    },
    {
      id: 'reason-6',
      emoji: '💍',
      title: 'Growing Old With You',
      description: 'Every chapter with you is my favorite, and I cannot wait for a lifetime more of holding your hand.'
    }
  ],
  videoUrl: '',
  musicAutoplay: true
};

const STORAGE_KEY = 'kajal_19th_birthday_app_data_v2';

export function loadAnniversaryData(): AnniversaryData {
  try {
    // Check URL hash for shared config
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#data=')) {
      const encoded = window.location.hash.slice(6);
      const json = decodeURIComponent(atob(encoded));
      const parsed = JSON.parse(json);
      return { ...DEFAULT_ANNIVERSARY_DATA, ...parsed };
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_ANNIVERSARY_DATA, ...parsed };
    }
  } catch (err) {
    console.warn('Could not parse saved anniversary data:', err);
  }
  return DEFAULT_ANNIVERSARY_DATA;
}

export function saveAnniversaryData(data: AnniversaryData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save anniversary data:', err);
  }
}

export function resetAnniversaryData(): AnniversaryData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
  return DEFAULT_ANNIVERSARY_DATA;
}

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
