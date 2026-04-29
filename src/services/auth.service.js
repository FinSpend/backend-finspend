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

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("Pengguna tidak ditemukan")

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw new Error("Password saat ini salah")

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}

export const deleteAccount = async (userId) => {
  // Hapus semua data user secara berurutan (sesuai foreign key dependency)
  await prisma.$transaction([
    prisma.aiSuggestion.deleteMany({ where: { userId } }),
    prisma.report.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.userProfile.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId, isDefault: false } }),
    prisma.user.delete({ where: { id: userId } }),
  ])
}

export const updateUser = async (userId, { name }) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, avatarUrl: true, plan: true, createdAt: true },
  })
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