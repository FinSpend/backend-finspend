import * as aiService from "../services/ai.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const generateSuggestion = async (req, res) => {
  try {
    const data = await aiService.generateSuggestion(req.user.id)
    successResponse(res, data, "Saran AI berhasil dibuat", 201)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const getSuggestions = async (req, res) => {
  try {
    const data = await aiService.getSuggestions(req.user.id)
    successResponse(res, data)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const updateSuggestion = async (req, res) => {
  try {
    const data = await aiService.updateSuggestion(req.user.id, req.params.id, req.body)
    successResponse(res, data, "Saran berhasil diperbarui")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}
