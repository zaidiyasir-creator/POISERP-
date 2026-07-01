import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request parsing
  app.use(express.json());

  const CONFIG_FILE = path.join(process.cwd(), 'menu_visibility.json');

  // Helper to load config
  const loadMenuVisibility = () => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading config file:', e);
    }
    return null;
  };

  // Helper to save config
  const saveMenuVisibility = (data: any) => {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing config file:', e);
    }
  };

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/menu-visibility", (req, res) => {
    const data = loadMenuVisibility();
    res.json({ menuVisibility: data });
  });

  app.post("/api/menu-visibility", (req, res) => {
    const { menuVisibility } = req.body;
    if (menuVisibility) {
      saveMenuVisibility(menuVisibility);
      res.json({ success: true, menuVisibility });
    } else {
      res.status(400).json({ error: 'menuVisibility is required' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
