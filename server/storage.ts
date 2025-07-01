import { users, brailleWords, userSessions, type User, type InsertUser, type BrailleWord, type InsertBrailleWord, type UserSession, type InsertUserSession } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBrailleWords(): Promise<BrailleWord[]>;
  getBrailleWordsByPattern(pattern: string): Promise<BrailleWord[]>;
  createBrailleWord(word: InsertBrailleWord): Promise<BrailleWord>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(): Promise<UserSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private brailleWords: Map<number, BrailleWord>;
  private userSessions: Map<number, UserSession>;
  private currentUserId: number;
  private currentBrailleWordId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.brailleWords = new Map();
    this.userSessions = new Map();
    this.currentUserId = 1;
    this.currentBrailleWordId = 1;
    this.currentSessionId = 1;
    this.initializeBrailleDictionary();
  }

  private initializeBrailleDictionary() {
    // Initialize with common English words and their Braille patterns
    const commonWords = [
      { word: "the", braillePattern: "2456" },
      { word: "and", braillePattern: "12346" },
      { word: "for", braillePattern: "123456" },
      { word: "are", braillePattern: "12456" },
      { word: "as", braillePattern: "1246" },
      { word: "with", braillePattern: "23456" },
      { word: "his", braillePattern: "236" },
      { word: "they", braillePattern: "1456" },
      { word: "be", braillePattern: "23" },
      { word: "at", braillePattern: "1" },
      { word: "one", braillePattern: "156" },
      { word: "have", braillePattern: "125" },
      { word: "this", braillePattern: "1456" },
      { word: "from", braillePattern: "124" },
      { word: "or", braillePattern: "135" },
      { word: "had", braillePattern: "125" },
      { word: "by", braillePattern: "12" },
      { word: "word", braillePattern: "2456" },
      { word: "but", braillePattern: "12" },
      { word: "not", braillePattern: "1345" },
      { word: "what", braillePattern: "156" },
      { word: "all", braillePattern: "1" },
      { word: "were", braillePattern: "2356" },
      { word: "we", braillePattern: "2456" },
      { word: "when", braillePattern: "156" },
      { word: "your", braillePattern: "13456" },
      { word: "can", braillePattern: "14" },
      { word: "said", braillePattern: "234" },
      { word: "there", braillePattern: "2346" },
      { word: "each", braillePattern: "15" },
      { word: "which", braillePattern: "156" },
      { word: "she", braillePattern: "146" },
      { word: "do", braillePattern: "145" },
      { word: "how", braillePattern: "125" },
      { word: "their", braillePattern: "2346" },
      { word: "if", braillePattern: "124" },
      { word: "will", braillePattern: "2456" },
      { word: "up", braillePattern: "136" },
      { word: "other", braillePattern: "1456" },
      { word: "about", braillePattern: "1" },
      { word: "out", braillePattern: "1256" },
      { word: "many", braillePattern: "134" },
      { word: "then", braillePattern: "2346" },
      { word: "them", braillePattern: "2346" },
      { word: "these", braillePattern: "2346" },
      { word: "so", braillePattern: "234" },
      { word: "some", braillePattern: "234" },
      { word: "her", braillePattern: "1235" },
      { word: "would", braillePattern: "2456" },
      { word: "make", braillePattern: "134" },
      { word: "like", braillePattern: "123" },
      { word: "into", braillePattern: "1345" },
      { word: "him", braillePattern: "125" },
      { word: "has", braillePattern: "125" },
      { word: "two", braillePattern: "2345" },
      { word: "more", braillePattern: "134" },
      { word: "very", braillePattern: "1236" },
      { word: "after", braillePattern: "1" },
      { word: "words", braillePattern: "2456" },
      { word: "just", braillePattern: "245" },
      { word: "first", braillePattern: "124" },
      { word: "any", braillePattern: "12456" },
      { word: "new", braillePattern: "1345" },
      { word: "work", braillePattern: "2456" },
      { word: "part", braillePattern: "1234" },
      { word: "take", braillePattern: "2345" },
      { word: "get", braillePattern: "1245" },
      { word: "place", braillePattern: "1234" },
      { word: "made", braillePattern: "134" },
      { word: "live", braillePattern: "123" },
      { word: "where", braillePattern: "156" },
      { word: "much", braillePattern: "134" },
      { word: "through", braillePattern: "1456" },
      { word: "back", braillePattern: "12" },
      { word: "little", braillePattern: "123" },
      { word: "only", braillePattern: "1345" },
      { word: "round", braillePattern: "1235" },
      { word: "man", braillePattern: "134" },
      { word: "year", braillePattern: "13456" },
      { word: "came", braillePattern: "14" },
      { word: "show", braillePattern: "146" },
      { word: "every", braillePattern: "15" },
      { word: "good", braillePattern: "1245" },
      { word: "me", braillePattern: "134" },
      { word: "give", braillePattern: "1245" },
      { word: "our", braillePattern: "1256" },
      { word: "under", braillePattern: "136" },
      { word: "name", braillePattern: "1345" },
      { word: "should", braillePattern: "146" },
      { word: "home", braillePattern: "125" },
      { word: "big", braillePattern: "12" },
      { word: "give", braillePattern: "1245" },
      { word: "air", braillePattern: "1" },
      { word: "line", braillePattern: "123" },
      { word: "set", braillePattern: "234" },
      { word: "own", braillePattern: "1256" },
      { word: "say", braillePattern: "234" },
      { word: "small", braillePattern: "234" },
      { word: "end", braillePattern: "15" },
      { word: "why", braillePattern: "13456" },
      { word: "cat", braillePattern: "14" },
      { word: "dog", braillePattern: "145" },
      { word: "run", braillePattern: "1235" },
      { word: "jump", braillePattern: "245" },
      { word: "happy", braillePattern: "125" },
      { word: "sad", braillePattern: "234" },
      { word: "big", braillePattern: "12" },
      { word: "small", braillePattern: "234" }
    ];

    commonWords.forEach((item, index) => {
      const brailleWord: BrailleWord = {
        id: index + 1,
        word: item.word,
        braillePattern: item.braillePattern,
        frequency: Math.floor(Math.random() * 1000) + 1,
        language: "en"
      };
      this.brailleWords.set(brailleWord.id, brailleWord);
    });
    this.currentBrailleWordId = commonWords.length + 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBrailleWords(): Promise<BrailleWord[]> {
    return Array.from(this.brailleWords.values());
  }

  async getBrailleWordsByPattern(pattern: string): Promise<BrailleWord[]> {
    return Array.from(this.brailleWords.values()).filter(
      word => word.braillePattern.includes(pattern)
    );
  }

  async createBrailleWord(insertWord: InsertBrailleWord): Promise<BrailleWord> {
    const id = this.currentBrailleWordId++;
    const word: BrailleWord = { ...insertWord, id };
    this.brailleWords.set(id, word);
    return word;
  }

  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = this.currentSessionId++;
    const session: UserSession = { 
      ...insertSession, 
      id,
      createdAt: new Date()
    };
    this.userSessions.set(id, session);
    return session;
  }

  async getUserSessions(): Promise<UserSession[]> {
    return Array.from(this.userSessions.values());
  }
}

export const storage = new MemStorage();
