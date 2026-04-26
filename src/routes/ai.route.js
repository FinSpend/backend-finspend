import { Router } from "express"
import {
  generateSuggestion,
  getSuggestions,
  updateSuggestion,
} from "../controllers/ai.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

router.use(authenticate)

router.post("/suggest", generateSuggestion)
router.get("/suggestions", getSuggestions)
router.patch("/suggestions/:id", updateSuggestion)

export default router
