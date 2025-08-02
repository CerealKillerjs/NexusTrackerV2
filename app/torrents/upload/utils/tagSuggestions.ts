/**
 * Tag Suggestions Utility
 * Automatically generates tag suggestions based on filename and category
 */

type TagFunction = (match: string) => string;

interface TagPattern {
  pattern: RegExp;
  tag: string | TagFunction;
}

export interface TagPatterns {
  Movies: {
    resolution: TagPattern[];
    format: TagPattern[];
    source: TagPattern[];
    audio: TagPattern[];
    language: TagPattern[];
    genre: TagPattern[];
  };
  TV: {
    resolution: TagPattern[];
    format: TagPattern[];
    source: TagPattern[];
    audio: TagPattern[];
    language: TagPattern[];
    series: TagPattern[];
  };
  Music: {
    format: TagPattern[];
    quality: TagPattern[];
    type: TagPattern[];
  };
  Software: {
    platform: TagPattern[];
    type: TagPattern[];
  };
  Games: {
    platform: TagPattern[];
    type: TagPattern[];
  };
  Books: {
    format: TagPattern[];
    type: TagPattern[];
  };
}

interface DefaultTags {
  [key: string]: string[];
}

// Tag recognition patterns by category
const TAG_PATTERNS: TagPatterns = {
  Movies: {
    resolution: [
      { pattern: /\b(4k|2160p)\b/i, tag: '4K' },
      { pattern: /\b(8k|4320p)\b/i, tag: '8K' },
      { pattern: /\b1080p\b/i, tag: '1080p' },
      { pattern: /\b720p\b/i, tag: '720p' },
      { pattern: /\b480p\b/i, tag: '480p' },
      { pattern: /\b360p\b/i, tag: '360p' },
      { pattern: /\b240p\b/i, tag: '240p' }
    ],
    format: [
      { pattern: /\b(x264|h264)\b/i, tag: 'x264' },
      { pattern: /\b(x265|h265|hevc)\b/i, tag: 'x265' },
      { pattern: /\b(xvid)\b/i, tag: 'XviD' },
      { pattern: /\.(mkv|mp4|avi)\b/i, tag: (match: string) => match.slice(1).toUpperCase() },
      { pattern: /\((mkv|mp4|avi)\)/i, tag: (match: string) => match.slice(1, -1).toUpperCase() },
    ],
    source: [
      { pattern: /\b(bluray|bdrip)\b/i, tag: 'BluRay' },
      { pattern: /\b(web-?dl|webrip)\b/i, tag: 'WebDL' },
      { pattern: /\b(dvdrip)\b/i, tag: 'DVDRip' },
      { pattern: /\b(hdtv)\b/i, tag: 'HDTV' }
    ],
    audio: [
      { pattern: /\b(dts|dts-hd)\b/i, tag: 'DTS' },
      { pattern: /\b(dd5\.1|dolby)\b/i, tag: 'Dolby' },
      { pattern: /\b(aac)\b/i, tag: 'AAC' }
    ],
    language: [
      { pattern: /\b(es|esp|spanish|castellano)\b/i, tag: 'Castellano' },
      { pattern: /\b(lat|latino)\b/i, tag: 'Latino' },
      { pattern: /\b(en|eng|english|ingles)\b/i, tag: 'Inglés' },
      { pattern: /\b(fr|français|francés)\b/i, tag: 'Francés' },
      { pattern: /\b(de|deutsch|alemán)\b/i, tag: 'Alemán' },
      { pattern: /\b(it|italiano)\b/i, tag: 'Italiano' },
      { pattern: /\b(ja|japanese|japones)\b/i, tag: 'Japonés' },
      { pattern: /\b(pt|português|portugués)\b/i, tag: 'Portugués' },
      { pattern: /\b(ru|russian|ruso)\b/i, tag: 'Ruso' }
    ],
    genre: [
      { pattern: /\b(action)\b/i, tag: 'Action' },
      { pattern: /\b(comedy|comedia)\b/i, tag: 'Comedy' },
      { pattern: /\b(drama)\b/i, tag: 'Drama' },
      { pattern: /\b(horror)\b/i, tag: 'Horror' },
      { pattern: /\b(scifi|sci-fi)\b/i, tag: 'Sci-Fi' },
      { pattern: /\b(thriller)\b/i, tag: 'Thriller' },
      { pattern: /\b(romance)\b/i, tag: 'Romance' },
      { pattern: /\b(documentary|documental)\b/i, tag: 'Documentary' }
    ]
  },
  TV: {
    resolution: [
      { pattern: /\b(4k|2160p)\b/i, tag: '4K' },
      { pattern: /\b(1080p)\b/i, tag: '1080p' },
      { pattern: /\b(720p)\b/i, tag: '720p' },
      { pattern: /\b(480p)\b/i, tag: '480p' }
    ],
    format: [
      { pattern: /\b(x264|h264)\b/i, tag: 'x264' },
      { pattern: /\b(x265|h265|hevc)\b/i, tag: 'x265' },
      { pattern: /\.(mkv|mp4|avi)\b/i, tag: (match: string) => match.slice(1).toUpperCase() }
    ],
    source: [
      { pattern: /\b(bluray|bdrip)\b/i, tag: 'BluRay' },
      { pattern: /\b(web-?dl|webrip)\b/i, tag: 'WebDL' },
      { pattern: /\b(dvdrip)\b/i, tag: 'DVDRip' },
      { pattern: /\b(hdtv)\b/i, tag: 'HDTV' }
    ],
    audio: [
      { pattern: /\b(dts|dts-hd)\b/i, tag: 'DTS' },
      { pattern: /\b(dd5\.1|dolby)\b/i, tag: 'Dolby' },
      { pattern: /\b(aac)\b/i, tag: 'AAC' }
    ],
    language: [
      { pattern: /\b(es|esp|spanish|castellano)\b/i, tag: 'Castellano' },
      { pattern: /\b(lat|latino)\b/i, tag: 'Latino' },
      { pattern: /\b(en|eng|english|ingles)\b/i, tag: 'Inglés' },
      { pattern: /\b(fr|français|francés)\b/i, tag: 'Francés' }
    ],
    series: [
      { pattern: /\b(complete|completa)\b/i, tag: 'Complete' },
      { pattern: /\b(incomplete|incompleta)\b/i, tag: 'Incomplete' },
      { pattern: /\b(s\d{1,2}|season\s?\d{1,2}|temporada\s?\d{1,2})\b/i, tag: (match: string) => {
        const num = match.match(/\d{1,2}/)?.[0];
        return num ? `Season ${num}` : match;
      } }
    ]
  },
  Music: {
    format: [
      { pattern: /\b(flac)\b/i, tag: 'FLAC' },
      { pattern: /\b(mp3)\b/i, tag: 'MP3' },
      { pattern: /\b(m4a|aac)\b/i, tag: 'AAC' },
      { pattern: /\b(wav)\b/i, tag: 'WAV' },
      { pattern: /\b(aiff)\b/i, tag: 'AIFF' },
      { pattern: /\b(ape)\b/i, tag: 'APE' },
      { pattern: /\b(tak)\b/i, tag: 'TAK' },
      { pattern: /\b(wv)\b/i, tag: 'WAVPACK' },
      { pattern: /\b(alac)\b/i, tag: 'ALAC' },
      { pattern: /\b(dts)\b/i, tag: 'DTS' },
      { pattern: /\b(ac3)\b/i, tag: 'AC3' }
    ],
    quality: [
      { pattern: /\b(320|320kbps)\b/i, tag: '320kbps' },
      { pattern: /\b(192|192kbps)\b/i, tag: '192kbps' },
      { pattern: /\b(128|128kbps)\b/i, tag: '128kbps' },
      { pattern: /\b(96|96kbps)\b/i, tag: '96kbps' },
      { pattern: /\b(v0|v2)\b/i, tag: match => match.toUpperCase() },
      { pattern: /\b(lossless)\b/i, tag: 'Lossless' }
    ],
    type: [
      { pattern: /\b(album)\b/i, tag: 'Album' },
      { pattern: /\b(single)\b/i, tag: 'Single' },
      { pattern: /\b(ost|soundtrack)\b/i, tag: 'OST' },
      { pattern: /\b(live)\b/i, tag: 'Live' },
      { pattern: /\b(ep)\b/i, tag: 'EP' },
      { pattern: /\b(compilation)\b/i, tag: 'Compilation' }
    ]
  },
  Software: {
    platform: [
      { pattern: /\b(windows|win(32|64))\b/i, tag: 'Windows' },
      { pattern: /\b(macos|mac)\b/i, tag: 'macOS' },
      { pattern: /\b(linux)\b/i, tag: 'Linux' },
      { pattern: /\b(android)\b/i, tag: 'Android' },
      { pattern: /\b(ios)\b/i, tag: 'iOS' }
    ],
    type: [
      { pattern: /\b(portable)\b/i, tag: 'Portable' },
      { pattern: /\b(repack)\b/i, tag: 'Repack' },
      { pattern: /\b(retail)\b/i, tag: 'Retail' },
      { pattern: /\b(cracked)\b/i, tag: 'Cracked' },
      { pattern: /\b(pro)\b/i, tag: 'Pro' },
      { pattern: /\b(enterprise)\b/i, tag: 'Enterprise' }
    ]
  },
  Games: {
    platform: [
      { pattern: /\b(pc)\b/i, tag: 'PC' },
      { pattern: /\b(ps[1-5])\b/i, tag: match => match.toUpperCase() },
      { pattern: /\b(switch)\b/i, tag: 'Switch' },
      { pattern: /\b(xbox)\b/i, tag: 'Xbox' },
      { pattern: /\b(nintendo)\b/i, tag: 'Nintendo' }
    ],
    type: [
      { pattern: /\b(repack)\b/i, tag: 'Repack' },
      { pattern: /\b(goty)\b/i, tag: 'GOTY' },
      { pattern: /\b(dlc)\b/i, tag: 'DLC' },
      { pattern: /\b(update|patch)\b/i, tag: 'Update' },
      { pattern: /\b(crack)\b/i, tag: 'Crack' }
    ]
  },
  Books: {
    format: [
      { pattern: /\b(pdf)\b/i, tag: 'PDF' },
      { pattern: /\b(epub)\b/i, tag: 'EPUB' },
      { pattern: /\b(mobi)\b/i, tag: 'MOBI' },
      { pattern: /\b(azw3)\b/i, tag: 'AZW3' },
      { pattern: /\b(txt)\b/i, tag: 'TXT' },
      { pattern: /\b(doc|docx)\b/i, tag: 'DOC' }
    ],
    type: [
      { pattern: /\b(ebook)\b/i, tag: 'Ebook' },
      { pattern: /\b(book|novel)\b/i, tag: 'Book' },
      { pattern: /\b(manual|guide|tutorial)\b/i, tag: 'Manual' },
      { pattern: /\b(magazine|revista)\b/i, tag: 'Magazine' },
      { pattern: /\b(course|curso)\b/i, tag: 'Course' }
    ]
  }
};

// Default tags by category
const DEFAULT_TAGS: DefaultTags = {
  Movies: ['HD', 'HDR', 'Subbed', 'Dubbed'],
  TV: ['HD', 'Subbed', 'Dubbed', 'Season'],
  Music: ['EP', 'Compilation', 'Discography'],
  Software: ['Cracked', 'Pro', 'Enterprise', 'Update'],
  Games: ['RPG', 'Action', 'Strategy', 'Simulation'],
  Books: ['Ebook', 'Comic', 'Magazine', 'Course'],
  Other: ['Misc', 'Archive', 'Collection']
};

export function generateTagSuggestions(category: keyof TagPatterns | 'Other', name: string): string[] {
  const suggestions = new Set<string>();
  
  if (TAG_PATTERNS[category as keyof TagPatterns]) {
    Object.values(TAG_PATTERNS[category as keyof TagPatterns]).forEach((patterns: TagPattern[]) => {
      patterns.forEach(({ pattern, tag }) => {
        const match = name.match(pattern);
        if (match) {
          suggestions.add(typeof tag === 'function' ? tag(match[0]) : tag);
        }
      });
    });
  }

  const defaultTags = DEFAULT_TAGS[category] || DEFAULT_TAGS.Other;
  defaultTags.forEach((tag: string) => {
    if (suggestions.size < 10) {
      suggestions.add(tag);
    }
  });

  return Array.from(suggestions);
} 