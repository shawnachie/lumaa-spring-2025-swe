import { InsertUser, User, Task, InsertTask, UpdateTask, users, tasks } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, userId: number, update: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<boolean>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTasks(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask & { userId: number }): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, isComplete: false })
      .returning();
    return newTask;
  }

  async updateTask(
    id: number,
    userId: number,
    update: UpdateTask
  ): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    const [task] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!task;
  }
}

export const storage = new DatabaseStorage();