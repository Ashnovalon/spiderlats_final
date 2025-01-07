import { PrismaClient } from "@prisma/client";

// Singleton pattern to prevent multiple instances in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(); // Create a new PrismaClient in production
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient(); // Store PrismaClient in the global object
  }
  prisma = (global as any).prisma; // Reuse the existing client during development
}

export default prisma;
