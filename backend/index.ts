import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config(); // MUST be first

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJson: any = undefined;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (req.path.startsWith("/api")) {
      let line = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) {
        line += " :: " + JSON.stringify(capturedJson);
      }
      if (line.length > 100) line = line.slice(0, 99) + "…";
      log(line);
    }
  });

  next();
});

(async () => {
  try {
    // Validate environment variables
    const { validateEnvironment } = await import("./env");
    validateEnvironment();

    // Initialize database
    const { initializeDatabase } = await import("./database");
    await initializeDatabase();

    // Register all routes
    const server = await registerRoutes(app);

    // Global Error Handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("ERROR:", err);
      res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
      });
    });

    // Setup Vite (Dev) or static build (Prod)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    server.listen(PORT, () => {
      log(`🚀 Server running at http://localhost:${PORT}`);
      log(`🤖 Chatbot (OpenAI) at POST /api/chat`);
    });

    // Graceful Shutdown
    process.on("SIGINT", () => {
      log("Shutting down...");
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();