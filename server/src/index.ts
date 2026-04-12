import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { AppDataSource } from "./data-source";
import { FamilyEntity } from "./entity/FamilyEntity";
import { Item } from "./entity/Item";
import { Task } from "./entity/Task";
import webpush from "web-push";
import { authMiddleware } from "./middleware/auth";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import pushRoutes from "./routes/push";
import entityRoutes from "./routes/entities";
import itemRoutes from "./routes/items";
import taskRoutes from "./routes/tasks";

// Configure VAPID for web push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "https://familyhub.example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

const app = express();

const ROOT = __filename.endsWith(".ts")
  ? path.join(__dirname, "..", "..")
  : path.join(__dirname, "..");

const BUILD_VERSION = `familyhub-${Date.now()}`;

app.use(express.json());

// Serve sw.js with injected cache-bust version
app.get("/sw.js", (_req, res) => {
  const src = fs
    .readFileSync(path.join(ROOT, "sw.js"), "utf8")
    .replace("__CACHE_VERSION__", BUILD_VERSION);
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "no-store");
  res.send(src);
});

// Serve frontend static files
app.use(express.static(ROOT));

// ── Public auth routes (no JWT required) ─────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/push", pushRoutes);

// ── Protected API routes ──────────────────────────────────────────────────────
app.get("/api/data", authMiddleware, async (_req, res, next) => {
  try {
    const [entities, items, tasks] = await Promise.all([
      AppDataSource.getRepository(FamilyEntity).find({
        relations: ["sections"],
        order: { sections: { sortOrder: "ASC" } },
      }),
      AppDataSource.getRepository(Item).find({ order: { sortOrder: "ASC" } }),
      AppDataSource.getRepository(Task).find({ order: { createdAt: "DESC" } }),
    ]);
    res.json({ entities, items, tasks });
  } catch (err) {
    next(err);
  }
});

app.use("/api/entities", authMiddleware, entityRoutes);
app.use("/api/items", authMiddleware, itemRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

// Central error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3000", 10);

AppDataSource.initialize()
  .then(async () => {
    console.log("Running database migrations…");
    await AppDataSource.runMigrations();
    console.log("Migrations up to date.");
    app.listen(PORT, () => {
      console.log(`FamilyHub running at http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
