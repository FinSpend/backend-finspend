import * as transactionService from "../services/transaction.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const getTransactions = async (req, res) => {
  try {
    const { type, categoryId, startDate, endDate } = req.query
    const data = await transactionService.getByUserId(req.user.id, {
      type,
      categoryId,
      startDate,
      endDate,
    })
    successResponse(res, data)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const createTransaction = async (req, res) => {
  try {
    const { categoryId, type, amount, description, transactionDate } = req.body
    if (!categoryId || !type || !amount || !transactionDate) {
      return errorResponse(res, "categoryId, type, amount, dan transactionDate wajib diisi", 400)
    }

    const data = await transactionService.create(req.user.id, req.body)
    successResponse(res, data, "Transaksi berhasil ditambahkan", 201)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const updateTransaction = async (req, res) => {
  try {
    const data = await transactionService.update(req.user.id, req.params.id, req.body)
    successResponse(res, data, "Transaksi berhasil diperbarui")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}

export const deleteTransaction = async (req, res) => {
  try {
    await transactionService.remove(req.user.id, req.params.id)
    successResponse(res, null, "Transaksi berhasil dihapus")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
      return errorResponse(res, "startDate dan endDate wajib diisi", 400)
    }

    const data = await transactionService.getSummary(req.user.id, startDate, endDate)
    successResponse(res, data)
  } catch (err) {
    errorResponse(res, err.message)
  }
}
