import * as categoryService from "../services/category.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const getCategories = async (req, res) => {
  try {
    const data = await categoryService.getByUserId(req.user.id)
    successResponse(res, data)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body
    if (!name || !type) {
      return errorResponse(res, "name dan type wajib diisi", 400)
    }

    const data = await categoryService.create(req.user.id, req.body)
    successResponse(res, data, "Kategori berhasil dibuat", 201)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const updateCategory = async (req, res) => {
  try {
    const data = await categoryService.update(req.user.id, req.params.id, req.body)
    successResponse(res, data, "Kategori berhasil diperbarui")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}

export const updateSortOrder = async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) {
      return errorResponse(res, "items harus berupa array", 400)
    }

    await categoryService.updateSortOrder(req.user.id, items)
    successResponse(res, null, "Urutan kategori berhasil diperbarui")
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const deleteCategory = async (req, res) => {
  try {
    await categoryService.remove(req.user.id, req.params.id)
    successResponse(res, null, "Kategori berhasil dihapus")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}
