import { Router } from "express"
import {
  getCategories,
  createCategory,
  updateCategory,
  updateSortOrder,
  deleteCategory,
} from "../controllers/category.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

router.use(authenticate)

router.get("/", getCategories)
router.post("/", createCategory)
router.patch("/sort-order", updateSortOrder)
router.put("/:id", updateCategory)
router.delete("/:id", deleteCategory)

export default router
