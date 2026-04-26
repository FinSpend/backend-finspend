import * as budgetService from "../services/budget.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const getBudgets = async (req, res) => {
  try {
    const data = await budgetService.getByUserId(req.user.id)
    successResponse(res, data)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const createBudget = async (req, res) => {
  try {
    const { categoryId, limitAmount, startDate } = req.body
    if (!categoryId || !limitAmount || !startDate) {
      return errorResponse(res, "categoryId, limitAmount, dan startDate wajib diisi", 400)
    }

    const data = await budgetService.create(req.user.id, req.body)
    successResponse(res, data, "Budget berhasil dibuat", 201)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const updateBudget = async (req, res) => {
  try {
    const data = await budgetService.update(req.user.id, req.params.id, req.body)
    successResponse(res, data, "Budget berhasil diperbarui")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}

export const deleteBudget = async (req, res) => {
  try {
    await budgetService.remove(req.user.id, req.params.id)
    successResponse(res, null, "Budget berhasil dihapus")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}
