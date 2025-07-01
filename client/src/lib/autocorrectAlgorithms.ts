export interface SuggestionResult {
  word: string;
  confidence: number;
  distance: number;
  algorithm: string;
}

export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

export function damerauLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxDistance = len1 + len2;
  
  const H: number[][] = [];
  
  // Initialize the matrix
  for (let i = 0; i <= len1 + 1; i++) {
    H[i] = [];
    for (let j = 0; j <= len2 + 1; j++) {
      H[i][j] = maxDistance;
    }
  }
  
  H[0][0] = maxDistance;
  for (let i = 0; i <= len1; i++) {
    H[i + 1][0] = maxDistance;
    H[i + 1][1] = i;
  }
  for (let j = 0; j <= len2; j++) {
    H[0][j + 1] = maxDistance;
    H[1][j + 1] = j;
  }
  
  const da: Record<string, number> = {};
  
  for (let i = 1; i <= len1; i++) {
    let db = 0;
    for (let j = 1; j <= len2; j++) {
      const k = da[str2[j - 1]] || 0;
      const l = db;
      let cost = 1;
      if (str1[i - 1] === str2[j - 1]) {
        cost = 0;
        db = j;
      }
      
      H[i + 1][j + 1] = Math.min(
        H[i][j] + cost,           // substitution
        H[i + 1][j] + 1,          // insertion
        H[i][j + 1] + 1,          // deletion
        H[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }
    da[str1[i - 1]] = i;
  }
  
  return H[len1 + 1][len2 + 1];
}

export function jaroWinklerSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Identify matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Calculate common prefix (up to 4 characters)
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
}

export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  word: string = '';
  frequency: number = 0;
}

export class BrailleTrie {
  private root: TrieNode = new TrieNode();
  
  insert(word: string, pattern: string, frequency: number = 1): void {
    let current = this.root;
    
    for (const char of pattern) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    current.word = word;
    current.frequency = frequency;
  }
  
  search(pattern: string): string | null {
    let current = this.root;
    
    for (const char of pattern) {
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char)!;
    }
    
    return current.isEndOfWord ? current.word : null;
  }
  
  searchWithPrefix(prefix: string): Array<{ word: string; pattern: string; frequency: number }> {
    let current = this.root;
    
    // Navigate to the prefix
    for (const char of prefix) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }
    
    // Collect all words with this prefix
    const results: Array<{ word: string; pattern: string; frequency: number }> = [];
    this.dfs(current, prefix, results);
    
    return results.sort((a, b) => b.frequency - a.frequency);
  }
  
  private dfs(node: TrieNode, currentPattern: string, results: Array<{ word: string; pattern: string; frequency: number }>): void {
    if (node.isEndOfWord) {
      results.push({
        word: node.word,
        pattern: currentPattern,
        frequency: node.frequency
      });
    }
    
    for (const [char, child] of node.children) {
      this.dfs(child, currentPattern + char, results);
    }
  }
}

export class AutocorrectEngine {
  private trie: BrailleTrie = new BrailleTrie();
  private dictionary: Map<string, { word: string; pattern: string; frequency: number }> = new Map();
  
  constructor() {
    this.trie = new BrailleTrie();
    this.dictionary = new Map();
  }
  
  loadDictionary(words: Array<{ word: string; braillePattern: string; frequency: number }>): void {
    this.dictionary.clear();
    this.trie = new BrailleTrie();
    
    words.forEach(({ word, braillePattern, frequency }) => {
      const normalizedPattern = braillePattern.replace(/\s+/g, '');
      this.dictionary.set(word.toLowerCase(), { word, pattern: normalizedPattern, frequency });
      this.trie.insert(word.toLowerCase(), normalizedPattern, frequency);
    });
  }
  
  getSuggestions(input: string, maxDistance: number = 2, algorithm: 'levenshtein' | 'damerau' | 'jaro' = 'levenshtein'): SuggestionResult[] {
    const suggestions: SuggestionResult[] = [];
    const inputLower = input.toLowerCase();
    
    // Try exact match first
    const exactMatch = this.trie.search(inputLower);
    if (exactMatch) {
      suggestions.push({
        word: exactMatch,
        confidence: 100,
        distance: 0,
        algorithm: 'exact'
      });
      return suggestions;
    }
    
    // Try prefix match
    const prefixMatches = this.trie.searchWithPrefix(inputLower);
    prefixMatches.slice(0, 3).forEach(match => {
      suggestions.push({
        word: match.word,
        confidence: 90 - (match.pattern.length - inputLower.length) * 5,
        distance: match.pattern.length - inputLower.length,
        algorithm: 'prefix'
      });
    });
    
    // Calculate distance for all dictionary words
    for (const [word, data] of this.dictionary) {
      let distance: number;
      let confidence: number;
      
      switch (algorithm) {
        case 'damerau':
          distance = damerauLevenshteinDistance(inputLower, word);
          confidence = Math.max(0, 100 - (distance * 20));
          break;
        case 'jaro':
          const similarity = jaroWinklerSimilarity(inputLower, word);
          distance = 1 - similarity;
          confidence = similarity * 100;
          break;
        default:
          distance = levenshteinDistance(inputLower, word);
          confidence = Math.max(0, 100 - (distance * 15));
      }
      
      if (distance <= maxDistance && distance > 0) {
        // Boost confidence based on frequency
        const frequencyBoost = Math.log(data.frequency + 1) * 2;
        confidence = Math.min(99, confidence + frequencyBoost);
        
        suggestions.push({
          word: data.word,
          confidence: Math.round(confidence),
          distance,
          algorithm
        });
      }
    }
    
    // Remove duplicates and sort by confidence
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.word === suggestion.word)
    );
    
    return uniqueSuggestions
      .sort((a, b) => {
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return a.distance - b.distance;
      })
      .slice(0, 5);
  }
  
  getBraillePatternSuggestions(pattern: string, maxDistance: number = 2): SuggestionResult[] {
    const suggestions: SuggestionResult[] = [];
    
    for (const [word, data] of this.dictionary) {
      const distance = levenshteinDistance(pattern, data.pattern);
      
      if (distance <= maxDistance) {
        const confidence = Math.max(0, 100 - (distance * 20));
        const frequencyBoost = Math.log(data.frequency + 1) * 2;
        
        suggestions.push({
          word: data.word,
          confidence: Math.min(99, Math.round(confidence + frequencyBoost)),
          distance,
          algorithm: 'pattern'
        });
      }
    }
    
    return suggestions
      .sort((a, b) => {
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return a.distance - b.distance;
      })
      .slice(0, 5);
  }
}
