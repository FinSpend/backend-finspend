import * as authService from "../services/auth.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return errorResponse(res, "Nama, email, dan password wajib diisi", 400)
    }

    const { user, token } = await authService.register({ name, email, password })
    res.cookie("token", token, COOKIE_OPTIONS)
    successResponse(res, user, "Registrasi berhasil", 201)
  } catch (err) {
    errorResponse(res, err.message, 400)
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return errorResponse(res, "Email dan password wajib diisi", 400)
    }

    const { user, token } = await authService.login({ email, password })
    res.cookie("token", token, COOKIE_OPTIONS)
    successResponse(res, user, "Login berhasil")
  } catch (err) {
    errorResponse(res, err.message, 401)
  }
}

export const logout = (req, res) => {
  res.clearCookie("token")
  successResponse(res, null, "Logout berhasil")
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Password saat ini dan password baru wajib diisi", 400)
    }
    if (newPassword.length < 8) {
      return errorResponse(res, "Password baru minimal 8 karakter", 400)
    }
    await authService.changePassword(req.user.id, { currentPassword, newPassword })
    successResponse(res, null, "Password berhasil diubah")
  } catch (err) {
    errorResponse(res, err.message, 400)
  }
}

export const deleteAccount = async (req, res) => {
  try {
    await authService.deleteAccount(req.user.id)
    res.clearCookie("token")
    successResponse(res, null, "Akun berhasil dihapus")
  } catch (err) {
    errorResponse(res, err.message, 500)
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id)
    successResponse(res, user)
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}