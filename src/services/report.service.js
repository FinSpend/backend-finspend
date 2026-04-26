import prisma from "../config/prisma.js"

export const getByUserId = async (userId) => {
  return prisma.report.findMany({
    where: { userId },
    orderBy: { generatedAt: "desc" },
  })
}

export const generate = async (userId, { periodType, periodStart, periodEnd }) => {
  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: { gte: start, lte: end },
    },
    include: { category: true },
  })

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenseByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const name = t.category.name
      acc[name] = (acc[name] || 0) + Number(t.amount)
      return acc
    }, {})

  const incomeByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => {
      const name = t.category.name
      acc[name] = (acc[name] || 0) + Number(t.amount)
      return acc
    }, {})

  const summaryData = {
    income,
    expense,
    balance: income - expense,
    transactionCount: transactions.length,
    expenseByCategory,
    incomeByCategory,
    savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
  }

  return prisma.report.create({
    data: {
      userId,
      periodType,
      periodStart: start,
      periodEnd: end,
      summaryData,
      status: "generated",
    },
  })
}

// [PREMIUM] — download hanya untuk user premium
export const getDownloadUrl = async (userId, id) => {
  const report = await prisma.report.findFirst({ where: { id, userId } })
  if (!report) throw new Error("Laporan tidak ditemukan")
  if (!report.fileUrl) throw new Error("File laporan belum tersedia")

  return report.fileUrl
}
