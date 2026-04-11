const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const app = express();

// Build timestamp generated once per server start — used as the SW cache key
const BUILD_VERSION = `familyhub-${Date.now()}`;

app.use(express.json());

// Serve sw.js with the cache version injected so every deploy busts the cache
app.get("/sw.js", (req, res) => {
  const swPath = path.join(__dirname, "..", "sw.js");
  const src = fs
    .readFileSync(swPath, "utf8")
    .replace("__CACHE_VERSION__", BUILD_VERSION);
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "no-store"); // browser must always re-fetch the SW
  res.send(src);
});

// Serve the frontend (index.html, css/, js/)
app.use(express.static(path.join(__dirname, "..")));

// ── API routes ────────────────────────────────────────────────────────────────

// Single endpoint to load all data at once (used on app startup)
app.get("/api/data", (req, res) => {
  res.json(db.read());
});

app.use("/api/entities", require("./routes/entities"));
app.use("/api/items", require("./routes/items"));
app.use("/api/tasks", require("./routes/tasks"));

// SPA fallback — any unknown path serves index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FamilyHub running at http://localhost:${PORT}`);
});
