const { PrismaClient } = require("@prisma/client");

// Singleton pattern to prevent multiple instances in development
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(); // Create a new PrismaClient in production
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(); // Store PrismaClient in the global object
  }
  prisma = global.prisma; // Reuse the existing client during development
}

module.exports = prisma;
