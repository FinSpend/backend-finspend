import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import authRouter from "./routes/auth.route.js"
import transactionRouter from "./routes/transaction.route.js"
import budgetRouter from "./routes/budget.route.js"
import categoryRouter from "./routes/category.route.js"
import aiRouter from "./routes/ai.route.js"
import reportRouter from "./routes/report.route.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { seedDefaults } from "./services/category.service.js"

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8000",
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/auth", authRouter)
app.use("/api/transactions", transactionRouter)
app.use("/api/budgets", budgetRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/ai", aiRouter)
app.use("/api/reports", reportRouter)

app.use(errorHandler)

const PORT = process.env.PORT || 8000

app.listen(PORT, async () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
  await seedDefaults()
  console.log("✅ Kategori default siap")
})