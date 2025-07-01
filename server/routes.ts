import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBrailleWordSchema, insertUserSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all Braille words from dictionary
  app.get("/api/braille-words", async (req, res) => {
    try {
      const words = await storage.getBrailleWords();
      res.json(words);
    } catch (error) {
      console.error("Error fetching Braille words:", error);
      res.status(500).json({ error: "Failed to fetch Braille words" });
    }
  });

  // Search Braille words by pattern
  app.get("/api/braille-words/search", async (req, res) => {
    try {
      const { pattern } = req.query;
      if (!pattern || typeof pattern !== 'string') {
        return res.status(400).json({ error: "Pattern parameter is required" });
      }
      
      const words = await storage.getBrailleWordsByPattern(pattern);
      res.json(words);
    } catch (error) {
      console.error("Error searching Braille words:", error);
      res.status(500).json({ error: "Failed to search Braille words" });
    }
  });

  // Add new Braille word to dictionary
  app.post("/api/braille-words", async (req, res) => {
    try {
      const validatedData = insertBrailleWordSchema.parse(req.body);
      const word = await storage.createBrailleWord(validatedData);
      res.status(201).json(word);
    } catch (error) {
      console.error("Error creating Braille word:", error);
      res.status(400).json({ error: "Invalid word data" });
    }
  });

  // Save user session data
  app.post("/api/user-sessions", async (req, res) => {
    try {
      const validatedData = insertUserSessionSchema.parse(req.body);
      const session = await storage.createUserSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating user session:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Get user sessions for analytics
  app.get("/api/user-sessions", async (req, res) => {
    try {
      const sessions = await storage.getUserSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ error: "Failed to fetch user sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
