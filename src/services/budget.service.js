import prisma from "../config/prisma.js"

export const getByUserId = async (userId) => {
  const budgets = await prisma.budget.findMany({
    where: { userId, isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "expense",
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
        },
      })

      const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
      const limit = Number(budget.limitAmount)

      return {
        ...budget,
        spent,
        remaining: limit - spent,
        percentage: Math.round((spent / limit) * 100),
        isOver: spent > limit,
      }
    })
  )

  return budgetsWithSpent
}

export const create = async (userId, data) => {
  const { categoryId, limitAmount, period, startDate, endDate } = data

  return prisma.budget.create({
    data: {
      userId,
      categoryId,
      limitAmount,
      period: period || "monthly",
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
    include: { category: true },
  })
}

export const update = async (userId, id, data) => {
  const existing = await prisma.budget.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Budget tidak ditemukan")

  return prisma.budget.update({
    where: { id },
    data: {
      ...(data.limitAmount !== undefined && { limitAmount: data.limitAmount }),
      ...(data.period && { period: data.period }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    },
    include: { category: true },
  })
}

export const remove = async (userId, id) => {
  const existing = await prisma.budget.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Budget tidak ditemukan")

  return prisma.budget.delete({ where: { id } })
}
