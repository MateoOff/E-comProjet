// prismaClient.js
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'], // pour debug
});

export default prisma;
