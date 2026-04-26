import bcrypt from "bcrypt"
import prisma from "../config/prisma.js"
import { signToken } from "../utils/jwt.js"

export const register = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("Email sudah terdaftar")

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, plan: true, createdAt: true },
  })

  const token = signToken({ id: user.id, email: user.email, plan: user.plan })
  return { user, token }
}

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("Email atau password salah")

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error("Email atau password salah")

  const token = signToken({ id: user.id, email: user.email, plan: user.plan })
  const { passwordHash, ...safeUser } = user
  return { user: safeUser, token }
}

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      plan: true,
      createdAt: true,
      profile: true,
    },
  })
  if (!user) throw new Error("Pengguna tidak ditemukan")
  return user
}