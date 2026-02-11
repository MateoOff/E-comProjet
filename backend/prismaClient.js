// prismaClient.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL manquante dans le .env");
}

const adapter = new PrismaPg({
  connectionString,
  // Optionnel : si tu veux un pool plus grand
  // max: 20,
});

const prisma = new PrismaClient({
  adapter,
  // optionnel : log: ['query', 'info', 'warn', 'error']
});

export default prisma;
