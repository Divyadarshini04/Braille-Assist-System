import { BrailleWord } from "@shared/schema";

export const SAMPLE_DICTIONARY: BrailleWord[] = [
  { id: 1, word: "the", braillePattern: "2456", frequency: 1000, language: "en" },
  { id: 2, word: "and", braillePattern: "12346", frequency: 900, language: "en" },
  { id: 3, word: "for", braillePattern: "123456", frequency: 800, language: "en" },
  { id: 4, word: "are", braillePattern: "12456", frequency: 750, language: "en" },
  { id: 5, word: "as", braillePattern: "1246", frequency: 700, language: "en" },
  { id: 6, word: "with", braillePattern: "23456", frequency: 650, language: "en" },
  { id: 7, word: "his", braillePattern: "236", frequency: 600, language: "en" },
  { id: 8, word: "they", braillePattern: "1456", frequency: 550, language: "en" },
  { id: 9, word: "be", braillePattern: "23", frequency: 500, language: "en" },
  { id: 10, word: "at", braillePattern: "1", frequency: 450, language: "en" },
  { id: 11, word: "cat", braillePattern: "14", frequency: 100, language: "en" },
  { id: 12, word: "dog", braillePattern: "145", frequency: 95, language: "en" },
  { id: 13, word: "run", braillePattern: "1235", frequency: 90, language: "en" },
  { id: 14, word: "jump", braillePattern: "245", frequency: 85, language: "en" },
  { id: 15, word: "happy", braillePattern: "125", frequency: 80, language: "en" },
];

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expected: string;
  type: 'missing' | 'extra' | 'substitution' | 'transposition' | 'exact';
  description: string;
}

export const TEST_CASES: TestCase[] = [
  {
    id: "test1",
    name: "Missing Dot Error",
    input: "ca",
    expected: "cat",
    type: "missing",
    description: "Input missing final character"
  },
  {
    id: "test2", 
    name: "Extra Dot Error",
    input: "catt",
    expected: "cat",
    type: "extra",
    description: "Input has extra character at end"
  },
  {
    id: "test3",
    name: "Substitution Error", 
    input: "cot",
    expected: "cat",
    type: "substitution",
    description: "Middle character substituted"
  },
  {
    id: "test4",
    name: "Transposition Error",
    input: "act",
    expected: "cat", 
    type: "transposition",
    description: "First two characters swapped"
  },
  {
    id: "test5",
    name: "Multiple Errors",
    input: "dag",
    expected: "dog",
    type: "substitution",
    description: "Multiple character substitutions"
  },
  {
    id: "test6",
    name: "Exact Match",
    input: "run",
    expected: "run",
    type: "exact", 
    description: "Perfect input should return exact match"
  },
  {
    id: "test7",
    name: "Missing First Character",
    input: "og",
    expected: "dog",
    type: "missing",
    description: "Missing first character"
  },
  {
    id: "test8",
    name: "Extra First Character", 
    input: "rrun",
    expected: "run",
    type: "extra",
    description: "Extra character at beginning"
  },
  {
    id: "test9",
    name: "Case Insensitive",
    input: "CAT",
    expected: "cat",
    type: "exact",
    description: "Uppercase input should match lowercase"
  },
  {
    id: "test10",
    name: "Double Transposition",
    input: "mujp",
    expected: "jump", 
    type: "transposition",
    description: "Multiple character transpositions"
  }
];

export function generateRandomTestCase(): TestCase {
  const words = ["cat", "dog", "run", "jump", "happy", "the", "and", "with"];
  const word = words[Math.floor(Math.random() * words.length)];
  const errorTypes = ["missing", "extra", "substitution", "transposition"] as const;
  const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
  
  let input = word;
  
  switch (errorType) {
    case "missing":
      if (word.length > 1) {
        const pos = Math.floor(Math.random() * word.length);
        input = word.slice(0, pos) + word.slice(pos + 1);
      }
      break;
    case "extra":
      const pos = Math.floor(Math.random() * (word.length + 1));
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      input = word.slice(0, pos) + randomChar + word.slice(pos);
      break;
    case "substitution":
      if (word.length > 0) {
        const pos = Math.floor(Math.random() * word.length);
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        input = word.slice(0, pos) + randomChar + word.slice(pos + 1);
      }
      break;
    case "transposition":
      if (word.length > 1) {
        const pos = Math.floor(Math.random() * (word.length - 1));
        const chars = word.split('');
        [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
        input = chars.join('');
      }
      break;
  }
  
  return {
    id: `random_${Date.now()}`,
    name: `Random ${errorType} error`,
    input,
    expected: word,
    type: errorType,
    description: `Generated ${errorType} error test case`
  };
}
