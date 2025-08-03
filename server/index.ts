import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import compression from "compression";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Compression para respuestas
  app.use(compression());
  
  // Cache para respuestas estáticas
  app.use(express.static('public', {
    maxAge: '1h'
  }));

  // Mejor manejo de errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error('Error:', err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  const maxRetries = 3;
  let retryCount = 0;

  function startServer() {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
        retryCount++;
        log(`Port ${port} is in use, killing existing process...`);
        
        const exec = require('child_process').exec;
        exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
          if (error) {
            log(`Could not kill process: ${error}`);
            throw error;
          }
          
          setTimeout(() => {
            log(`Retrying to start server (attempt ${retryCount} of ${maxRetries})...`);
            startServer();
          }, 1000);
        });
      } else {
        throw err;
      }
    });
  }

  startServer();
})();
