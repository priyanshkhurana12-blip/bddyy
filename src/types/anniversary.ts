export interface MemoryPhoto {
  id: string;
  src: string;
  caption: string;
  date: string;
  location?: string;
  rotate: number;
}

export interface LoveReason {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface LoveLetter {
  title: string;
  salutation: string;
  paragraphs: string[];
  signOff: string;
  ps?: string;
}

export interface AnniversaryData {
  passkey: string;
  partnerName: string;
  senderName: string;
  anniversaryDate: string; // YYYY-MM-DD
  anniversaryYearText: string; // e.g. "1st", "2nd", "Golden"
  celebrationTitle: string;
  letter: LoveLetter;
  memories: MemoryPhoto[];
  reasons?: LoveReason[];
  videoUrl?: string;
  musicAutoplay: boolean;
}

export type StageType = 'lock' | 'show' | 'loading' | 'envelope' | 'main' | 'letter' | 'balloons' | 'memories' | 'video';
