import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg

// Tambahkan validasi
const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("❌ DATABASE_URL atau POSTGRES_PRISMA_URL tidak tersetting!")
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter
})

export default prisma