import prisma from "../config/prisma.js"

export const getByUserId = async (userId, filters = {}) => {
  const { type, categoryId, startDate, endDate } = filters

  const where = {
    userId,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(startDate || endDate
      ? {
          transactionDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),
  }

  return prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { transactionDate: "desc" },
  })
}

export const create = async (userId, data) => {
  const { categoryId, type, amount, description, transactionDate } = data

  return prisma.transaction.create({
    data: {
      userId,
      categoryId,
      type,
      amount,
      description,
      transactionDate: new Date(transactionDate),
    },
    include: { category: true },
  })
}

export const update = async (userId, id, data) => {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Transaksi tidak ditemukan")

  return prisma.transaction.update({
    where: { id },
    data: {
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.type && { type: data.type }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.transactionDate && { transactionDate: new Date(data.transactionDate) }),
    },
    include: { category: true },
  })
}

export const remove = async (userId, id) => {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Transaksi tidak ditemukan")

  return prisma.transaction.delete({ where: { id } })
}

export const getSummary = async (userId, startDate, endDate) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  })

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { income, expense, balance: income - expense, count: transactions.length }
}
