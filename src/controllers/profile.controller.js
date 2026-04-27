import * as profileService from "../services/profile.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.user.id)
    successResponse(res, profile)
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}

export const upsertProfile = async (req, res) => {
  try {
    const { monthlyIncome, monthlyExpense, currentSavings, incomeCurrency, occupation, dependents, financialGoals, riskProfile } = req.body
    if (monthlyIncome === undefined) {
      return errorResponse(res, "monthlyIncome wajib diisi", 400)
    }

    const profile = await profileService.upsertProfile(req.user.id, {
      monthlyIncome,
      monthlyExpense,
      currentSavings,
      incomeCurrency,
      occupation,
      dependents,
      financialGoals,
      riskProfile,
    })
    successResponse(res, profile, "Profil berhasil disimpan")
  } catch (err) {
    errorResponse(res, err.message, 400)
  }
}

export const deleteProfile = async (req, res) => {
  try {
    await profileService.deleteProfile(req.user.id)
    successResponse(res, null, "Profil berhasil dihapus")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}
