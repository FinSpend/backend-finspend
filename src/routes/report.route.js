import { Router } from "express"
import {
  getReports,
  generateReport,
  downloadReport,
} from "../controllers/report.controller.js"
import { authenticate, requirePremium } from "../middleware/auth.middleware.js"

const router = Router()

router.use(authenticate)

router.get("/", getReports)
router.post("/", generateReport)
router.get("/:id/download", requirePremium, downloadReport) // [PREMIUM]

export default router
