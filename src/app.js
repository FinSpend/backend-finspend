import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import authRouter from "./routes/auth.route.js"
import profileRouter from "./routes/profile.route.js"
import transactionRouter from "./routes/transaction.route.js"
import budgetRouter from "./routes/budget.route.js"
import categoryRouter from "./routes/category.route.js"
import aiRouter from "./routes/ai.route.js"
import reportRouter from "./routes/report.route.js"
import walletRouter from "./routes/wallet.route.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { seedDefaults } from "./services/category.service.js"

const app = express()

const allowedOrigins = [
  "http://localhost:3000",
  "https://spendfin.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.json())
app.use(cookieParser())

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})
app.get('/', (_req, res) => {
  res.send('Hello Express!')
})

app.use("/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/transactions", transactionRouter)
app.use("/api/budgets", budgetRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/ai", aiRouter)
app.use("/api/reports", reportRouter)
app.use("/api/wallets", walletRouter)

app.use(errorHandler)

// ✅ hanya untuk LOCAL
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, async () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`)
    await seedDefaults()
    console.log("✅ Kategori default siap")
  })
}

export default app