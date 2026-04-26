import * as authService from "../services/auth.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
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

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id)
    successResponse(res, user)
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}