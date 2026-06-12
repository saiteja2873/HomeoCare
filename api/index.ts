import { app, connectMongoAndBootstrap } from "./app.js";
import type { Request, Response } from "express";

// Initialize MongoDB connection
let isConnected = false;

async function handler(req: Request, res: Response) {
  // Connect to MongoDB if not already connected
  if (!isConnected) {
    try {
      await connectMongoAndBootstrap();
      isConnected = true;
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }

  // Let Express handle the request
  return app(req, res);
}

// Export for Vercel serverless
export default handler;

