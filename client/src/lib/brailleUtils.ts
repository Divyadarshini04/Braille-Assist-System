// Mapping of QWERTY keys to Braille dots
export const QWERTY_TO_BRAILLE: Record<string, number> = {
  'D': 1, 'd': 1,
  'W': 2, 'w': 2,
  'Q': 3, 'q': 3,
  'K': 4, 'k': 4,
  'O': 5, 'o': 5,
  'P': 6, 'p': 6,
};

// Braille alphabet mapping (dots to letters)
export const BRAILLE_TO_LETTER: Record<string, string> = {
  '1': 'A',
  '12': 'B',
  '14': 'C',
  '145': 'D',
  '15': 'E',
  '124': 'F',
  '1245': 'G',
  '125': 'H',
  '24': 'I',
  '245': 'J',
  '13': 'K',
  '123': 'L',
  '134': 'M',
  '1345': 'N',
  '135': 'O',
  '1234': 'P',
  '12345': 'Q',
  '1235': 'R',
  '234': 'S',
  '2345': 'T',
  '136': 'U',
  '1236': 'V',
  '2456': 'W',
  '1346': 'X',
  '13456': 'Y',
  '1356': 'Z',
};

// Reverse mapping for encoding
export const LETTER_TO_BRAILLE: Record<string, string> = Object.fromEntries(
  Object.entries(BRAILLE_TO_LETTER).map(([dots, letter]) => [letter, dots])
);

export interface BrailleCharacter {
  dots: number[];
  letter: string;
  pattern: string;
}

export function convertKeysToBrailleDots(keys: string[]): number[] {
  return keys
    .map(key => QWERTY_TO_BRAILLE[key])
    .filter(dot => dot !== undefined)
    .sort((a, b) => a - b);
}

export function convertDotsToLetter(dots: number[]): string {
  const pattern = dots.join('');
  return BRAILLE_TO_LETTER[pattern] || '';
}

export function convertDotsToBraillePattern(dots: number[]): boolean[] {
  const pattern = new Array(6).fill(false);
  dots.forEach(dot => {
    if (dot >= 1 && dot <= 6) {
      pattern[dot - 1] = true;
    }
  });
  return pattern;
}

export function convertLetterToDots(letter: string): number[] {
  const pattern = LETTER_TO_BRAILLE[letter.toUpperCase()];
  if (!pattern) return [];
  return pattern.split('').map(Number);
}

export function convertWordToBraillePattern(word: string): string {
  return word
    .toUpperCase()
    .split('')
    .map(letter => LETTER_TO_BRAILLE[letter] || '')
    .filter(pattern => pattern !== '')
    .join(' ');
}

export function isBrailleKey(key: string): boolean {
  return key.toUpperCase() in QWERTY_TO_BRAILLE;
}

export function normalizeBraillePattern(pattern: string): string {
  // Remove spaces and normalize pattern
  return pattern.replace(/\s+/g, '');
}

export class BraillePatternBuilder {
  private activeDots: Set<number> = new Set();
  
  addDot(dot: number): void {
    if (dot >= 1 && dot <= 6) {
      this.activeDots.add(dot);
    }
  }
  
  removeDot(dot: number): void {
    this.activeDots.delete(dot);
  }
  
  clear(): void {
    this.activeDots.clear();
  }
  
  getDots(): number[] {
    return Array.from(this.activeDots).sort((a, b) => a - b);
  }
  
  getPattern(): string {
    return this.getDots().join('');
  }
  
  getLetter(): string {
    return convertDotsToLetter(this.getDots());
  }
  
  getBrailleDisplay(): boolean[] {
    return convertDotsToBraillePattern(this.getDots());
  }
}
