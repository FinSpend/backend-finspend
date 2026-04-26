import { Router } from "express"
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} from "../controllers/transaction.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

router.use(authenticate)

router.get("/", getTransactions)
router.get("/summary", getSummary)
router.post("/", createTransaction)
router.put("/:id", updateTransaction)
router.delete("/:id", deleteTransaction)

export default router
