import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, authenticateToken } from "./auth";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/tasks", authenticateToken, async (req, res) => {
    const tasks = await storage.getTasks(req.user.id);
    res.json(tasks);
  });

  app.post("/tasks", authenticateToken, async (req, res) => {
    const validation = insertTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const task = await storage.createTask({
      ...validation.data,
      userId: req.user.id,
    });
    res.status(201).json(task);
  });

  app.put("/tasks/:id", authenticateToken, async (req, res) => {
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const task = await storage.updateTask(
      parseInt(req.params.id),
      req.user.id,
      validation.data,
    );

    if (!task) return res.sendStatus(404);
    res.json(task);
  });

  app.delete("/tasks/:id", authenticateToken, async (req, res) => {
    const success = await storage.deleteTask(
      parseInt(req.params.id),
      req.user.id,
    );

    if (!success) return res.sendStatus(404);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}