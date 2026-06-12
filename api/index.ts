import { app, connectMongoAndBootstrap } from "../server";

// Ensure MongoDB is connected before handling requests
connectMongoAndBootstrap().catch(console.error);

// Export the Express app for Vercel serverless
export default app;

