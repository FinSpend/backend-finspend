import prisma from "../config/prisma.js"

export const getProfile = async (userId) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } })
  return profile ?? null
}

export const upsertProfile = async (userId, data) => {
  const { monthlyIncome, monthlyExpense, currentSavings, incomeCurrency, occupation, dependents, financialGoals, riskProfile } = data

  const payload = { monthlyIncome, monthlyExpense, currentSavings, incomeCurrency, occupation, dependents, financialGoals, riskProfile }

  return prisma.userProfile.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  })
}

export const deleteProfile = async (userId) => {
  const existing = await prisma.userProfile.findUnique({ where: { userId } })
  if (!existing) throw new Error("Profil tidak ditemukan")
  await prisma.userProfile.delete({ where: { userId } })
}
