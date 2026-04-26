# Finspend Backend — CLAUDE.md

Instruksi untuk Claude Code agar memahami konteks proyek Backend Finspend.

---

## Deskripsi

REST API untuk aplikasi money management Finspend. Dibangun dengan Express.js, PostgreSQL via Prisma ORM. Melayani request dari Frontend Next.js dan nantinya bisa dipakai mobile app.

---

## Struktur folder

```
Backend/
├── .env                        # DATABASE_URL, JWT_SECRET
├── .gitignore
├── package.json                # "type": "module" — wajib ES Module
├── prisma.config.ts            # Konfigurasi Prisma v7 — datasource & adapter
└── src/
    ├── app.js                  # Entry point — dotenv harus import pertama
    ├── config/
    │   └── prisma.js           # PrismaClient dengan adapter pg
    ├── prisma/
    │   └── schema.prisma       # Schema database — TANPA url di datasource
    ├── controllers/            # Handler request/response
    │   ├── auth.controller.js
    │   ├── transaction.controller.js
    │   ├── budget.controller.js
    │   ├── category.controller.js
    │   ├── ai.controller.js
    │   └── report.controller.js
    ├── services/               # Business logic
    │   ├── auth.service.js
    │   ├── transaction.service.js
    │   ├── budget.service.js
    │   ├── category.service.js
    │   ├── ai.service.js
    │   └── report.service.js
    ├── routes/                 # Express router
    │   ├── auth.route.js
    │   ├── transaction.route.js
    │   ├── budget.route.js
    │   ├── category.route.js
    │   ├── ai.route.js
    │   └── report.route.js
    ├── middleware/
    │   ├── auth.middleware.js  # Verifikasi JWT
    │   └── error.middleware.js # Global error handler
    ├── utils/
    │   ├── jwt.js              # Sign & verify token
    │   └── response.js         # Helper format response JSON
    └── generated/
        └── prisma/             # Output dari npx prisma generate
```

---

## Tech stack

| Layer | Pilihan | Versi |
|---|---|---|
| Runtime | Node.js | v25 |
| Framework | Express.js | latest |
| Module system | ES Module | `"type": "module"` di package.json |
| ORM | Prisma | v7.8.0 |
| Database adapter | @prisma/adapter-pg | latest |
| Database driver | pg | latest |
| Database | PostgreSQL | lokal (dev), Supabase (prod) |
| Auth | JWT (jsonwebtoken) | latest |
| Password hash | bcrypt | latest |
| Validasi | Zod | latest |
| Env | dotenv | latest |
| Dev server | nodemon | latest |

---

## Environment variables

File `.env` di root folder `Backend/`:

```env
DATABASE_URL="postgresql://diosiregar:password@localhost:5432/finspend"
JWT_SECRET="kawkdaksdoiIAIWDjaldnOAWD)(12312K)adakwdakdn"
PORT=3001
```

Jangan pernah commit `.env`. Sudah ada di `.gitignore`.

---

## Konvensi kode

### Wajib: ES Module syntax
`package.json` sudah punya `"type": "module"`. Gunakan `import/export`, JANGAN `require/module.exports`.

```js
// ✅ Benar
import express from "express"
import prisma from "../config/prisma.js"
export default router

// ❌ Salah — akan crash
const express = require("express")
module.exports = router
```

### Wajib: ekstensi .js di setiap import
ES Module di Node.js wajib menyertakan ekstensi file lengkap:

```js
// ✅ Benar
import authRouter from "./routes/auth.route.js"
import prisma from "../config/prisma.js"

// ❌ Salah — akan crash dengan ERR_MODULE_NOT_FOUND
import authRouter from "./routes/auth.route"
```

### Entry point — app.js
`dotenv` harus di-import paling pertama sebelum module lain apapun:

```js
import "dotenv/config"     // ← HARUS baris pertama
import express from "express"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/auth", authRouter)
app.use("/api/transactions", transactionRouter)
// dst...

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

### Format response API
Selalu gunakan format yang konsisten:

```js
// ✅ Success
res.status(200).json({
  success: true,
  data: result,
  message: "Berhasil"
})

// ✅ Error
res.status(400).json({
  success: false,
  message: "Deskripsi error"
})
```

### Struktur controller — service pattern
Controller hanya handle request/response. Business logic ada di service:

```js
// controllers/transaction.controller.js
import * as transactionService from "../services/transaction.service.js"

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id
    const data = await transactionService.getByUserId(userId)
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

---

## Konfigurasi Prisma v7 — PENTING

Prisma v7 punya breaking change besar. Ikuti aturan ini dengan ketat:

### schema.prisma — TANPA url di datasource

```prisma
// src/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  // JANGAN tambahkan: url = env("DATABASE_URL")
  // Di Prisma v7, url sudah tidak didukung di schema
}
```

### prisma.config.ts — konfigurasi datasource

```ts
// prisma.config.ts (di root Backend/)
import path from "path"
import type { PrismaConfig } from "prisma"
import { PrismaPg } from "@prisma/adapter-pg"

export default {
  earlyAccess: true,
  schema: path.join("src", "prisma", "schema.prisma"),
  migrate: {
    async adapter(env) {
      const { Pool } = await import("pg")
      const pool = new Pool({ connectionString: env.DATABASE_URL })
      return new PrismaPg(pool)
    }
  }
} satisfies PrismaConfig
```

### config/prisma.js — inisialisasi PrismaClient

```js
// src/config/prisma.js
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

export default prisma
```

---

## Database schema

### Tabel users
```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String
  passwordHash String
  avatarUrl    String?
  plan         String    @default("free")  // "free" | "premium"
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  profile      UserProfile?
  categories   Category[]
  transactions Transaction[]
  budgets      Budget[]
  suggestions  AiSuggestion[]
  reports      Report[]
}
```

### Tabel user_profiles
```prisma
model UserProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  monthlyIncome  Int
  incomeCurrency String   @default("IDR")
  occupation     String?
  financialGoals Json
  riskProfile    String?
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

### Tabel transactions
```prisma
model Transaction {
  id              String   @id @default(uuid())
  userId          String
  categoryId      String
  type            String   // "income" | "expense"
  amount          Decimal
  currency        String   @default("IDR")
  description     String?
  transactionDate DateTime
  createdAt       DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
}
```

### Tabel categories
```prisma
model Category {
  id        String  @id @default(uuid())
  userId    String?
  name      String
  type      String  // "income" | "expense"
  color     String?
  icon      String?
  sortOrder Int     @default(0)
  isDefault Boolean @default(false)

  user         User?         @relation(fields: [userId], references: [id])
  transactions Transaction[]
  budgets      Budget[]
}
```

### Tabel budgets
```prisma
model Budget {
  id          String   @id @default(uuid())
  userId      String
  categoryId  String
  limitAmount Decimal
  period      String   // "monthly" | "weekly" | "custom"
  startDate   DateTime
  endDate     DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
}
```

### Tabel ai_suggestions
```prisma
model AiSuggestion {
  id        String   @id @default(uuid())
  userId    String
  type      String
  content   String
  metadata  Json?
  isRead    Boolean  @default(false)
  isApplied Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

### Tabel reports
```prisma
model Report {
  id           String   @id @default(uuid())
  userId       String
  periodType   String   // "monthly" | "quarterly" | "custom"
  periodStart  DateTime
  periodEnd    DateTime
  summaryData  Json
  fileUrl      String?  // null untuk free user
  status       String   @default("generated")
  generatedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

---

## API routes

### Auth (public)
```
POST   /auth/register     → daftar akun baru
POST   /auth/login        → login, return JWT di cookie
POST   /auth/logout       → hapus cookie
GET    /auth/me           → ambil data user dari token
```

### Transactions (protected)
```
GET    /api/transactions           → semua transaksi user (support query: type, categoryId, startDate, endDate)
POST   /api/transactions           → tambah transaksi baru
PUT    /api/transactions/:id       → update transaksi
DELETE /api/transactions/:id       → hapus transaksi
```

### Budgets (protected)
```
GET    /api/budgets                → semua budget aktif user
POST   /api/budgets                → buat budget baru
PUT    /api/budgets/:id            → update budget
DELETE /api/budgets/:id            → hapus budget
```

### Categories (protected)
```
GET    /api/categories             → semua kategori (default + milik user)
POST   /api/categories             → buat kategori baru
PUT    /api/categories/:id         → update (termasuk sort_order untuk drag & drop)
DELETE /api/categories/:id         → hapus kategori custom
```

### AI (protected)
```
POST   /api/ai/suggest             → minta saran AI berdasarkan profil & transaksi
GET    /api/ai/suggestions         → riwayat saran
PATCH  /api/ai/suggestions/:id     → tandai isRead / isApplied
```

### Reports (protected)
```
GET    /api/reports                → list laporan user
POST   /api/reports                → generate laporan baru
GET    /api/reports/:id/download   → download file (PREMIUM only)
```

---

## Middleware auth

Semua route `/api/*` wajib pakai middleware verifikasi JWT:

```js
// middleware/auth.middleware.js
import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, message: "Token tidak valid" })
  }
}
```

---

## Fitur premium — cara menandai

Route yang hanya boleh diakses user premium tambahkan middleware `requirePremium`:

```js
// middleware/auth.middleware.js
export const requirePremium = (req, res, next) => {
  if (req.user.plan !== "premium") {
    return res.status(403).json({
      success: false,
      message: "Fitur ini hanya tersedia untuk pengguna Premium"
    })
  }
  next()
}

// Penggunaan di route
router.get("/:id/download", authenticate, requirePremium, downloadReport)
```

Tandai juga dengan komentar `// [PREMIUM]` di baris yang relevan.

---

## Perintah yang sering dipakai

```bash
# Jalankan dev server (dengan nodemon)
npm run dev

# Jalankan sekali tanpa nodemon
node src/app.js

# Generate Prisma client setelah ubah schema
npx prisma generate

# Buat migrasi baru
npx prisma migrate dev --name <nama_migrasi>

# Reset database (hati-hati — hapus semua data)
npx prisma migrate reset

# Buka Prisma Studio
npx prisma studio

# Install dependency baru
npm install <package>
```

---

## Hal penting yang sudah dipelajari

- **Prisma v7 breaking change**: `url = env("DATABASE_URL")` di `schema.prisma` sudah tidak didukung. Wajib pakai `@prisma/adapter-pg` dan pass adapter ke `new PrismaClient({ adapter })`.
- **ES Module + ekstensi file**: Setiap import harus sertakan `.js` di akhir path. Tanpa ini akan crash dengan `ERR_MODULE_NOT_FOUND`.
- **dotenv harus pertama**: `import "dotenv/config"` harus di baris paling atas `app.js`, sebelum import apapun — termasuk sebelum import Prisma.
- **Jangan mix require & import**: Karena `"type": "module"`, seluruh codebase harus konsisten pakai ES Module.