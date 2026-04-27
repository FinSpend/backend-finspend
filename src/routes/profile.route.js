import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware.js"
import { getProfile, upsertProfile, deleteProfile } from "../controllers/profile.controller.js"

const router = Router()

router.use(authenticate)

router.get("/", getProfile)
router.put("/", upsertProfile)
router.delete("/", deleteProfile)

export default router
