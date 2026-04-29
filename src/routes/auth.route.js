import { Router } from "express"
import { register, login, logout, getMe, updateUser, changePassword, deleteAccount } from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", authenticate, logout)
router.get("/me", authenticate, getMe)
router.put("/me", authenticate, updateUser)
router.put("/password", authenticate, changePassword)
router.delete("/me", authenticate, deleteAccount)

export default router
