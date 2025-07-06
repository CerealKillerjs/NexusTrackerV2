/**
 * Category Detection Utility
 * Automatically detects torrent category based on filename patterns
 */

interface CategoryPattern {
  pattern: RegExp;
  category: 'Movies' | 'TV' | 'Music' | 'Books' | 'Games' | 'Software';
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  // Video patterns (Movies & TV)
  { pattern: /\.(mkv|mp4|avi|wmv|mov|flv|mpg|mpeg|m4v|webm)$/i, category: 'Movies' },
  { pattern: /\b(1080p|720p|2160p|4k|8k|bluray|bdrip|dvdrip|webrip|hdtv)\b/i, category: 'Movies' },
  { pattern: /\b(x264|x265|hevc|xvid|divx)\b/i, category: 'Movies' },
  { pattern: /\b(season|temporada|episode|episodio|s\d{1,2}e\d{1,2})\b/i, category: 'TV' },
  { pattern: /\b(series|serie|show)\b/i, category: 'TV' },
  
  // Audio patterns
  { pattern: /\.(mp3|flac|m4a|wav|wma|aac|ogg|opus|alac|ape|wv)$/i, category: 'Music' },
  { pattern: /\b(320kbps|192kbps|128kbps|v0|v2|lossless)\b/i, category: 'Music' },
  { pattern: /\b(album|ost|soundtrack|discography|ep|single)\b/i, category: 'Music' },
  
  // Applications patterns
  { pattern: /\.(exe|msi|dmg|pkg|deb|rpm|appimage|apk|ipa)$/i, category: 'Software' },
  { pattern: /\b(windows|macos|linux|android|ios|portable|cracked)\b/i, category: 'Software' },
  { pattern: /\b(x86|x64|arm64|setup|installer)\b/i, category: 'Software' },
  
  // Games patterns
  { pattern: /\b(ps[1-5]|xbox|switch|nintendo|steam|gog|repack|goty)\b/i, category: 'Games' },
  { pattern: /\b(rpg|fps|mmorpg|simulator|strategy|action)\b/i, category: 'Games' },
  { pattern: /\b(dlc|update|patch|crack|codex|plaza|skidrow)\b/i, category: 'Games' },
  
  // Books patterns
  { pattern: /\.(pdf|epub|mobi|azw3|txt|doc|docx)$/i, category: 'Books' },
  { pattern: /\b(ebook|book|novel|manual|guide|tutorial)\b/i, category: 'Books' }
];

export function detectCategory(filename: string): 'Movies' | 'TV' | 'Music' | 'Books' | 'Games' | 'Software' | 'Other' {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(filename)) {
      return category;
    }
  }
  return 'Other';
} 