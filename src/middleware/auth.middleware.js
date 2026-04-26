import { verifyToken } from "../utils/jwt.js"
import { errorResponse } from "../utils/response.js"

export const authenticate = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return errorResponse(res, "Unauthorized — silakan login terlebih dahulu", 401)

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch {
    errorResponse(res, "Token tidak valid atau sudah kedaluwarsa", 401)
  }
}

export const requirePremium = (req, res, next) => {
  if (req.user?.plan !== "premium") {
    return errorResponse(res, "Fitur ini hanya tersedia untuk pengguna Premium", 403)
  }
  next()
}