import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware.js"
import {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  transfer,
  getTransfers,
} from "../controllers/wallet.controller.js"

const router = Router()

router.use(authenticate)

router.get("/",            getWallets)
router.post("/",           createWallet)
router.put("/:id",         updateWallet)
router.delete("/:id",      deleteWallet)
router.get("/transfers",   getTransfers)
router.post("/transfer",   transfer)

export default router
