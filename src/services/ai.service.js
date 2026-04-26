import Anthropic from "@anthropic-ai/sdk"
import prisma from "../config/prisma.js"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const generateSuggestion = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })
  if (!user) throw new Error("Pengguna tidak ditemukan")

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const transactions = await prisma.transaction.findMany({
    where: { userId, transactionDate: { gte: startOfMonth } },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
    take: 50,
  })

  const budgets = await prisma.budget.findMany({
    where: { userId, isActive: true },
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

  const prompt = `
Kamu adalah asisten keuangan pribadi. Berikan saran budgeting yang spesifik dan actionable dalam Bahasa Indonesia.

Data pengguna:
- Nama: ${user.name}
- Penghasilan bulanan: Rp ${user.profile?.monthlyIncome?.toLocaleString("id-ID") || "belum diisi"}
- Tujuan finansial: ${JSON.stringify(user.profile?.financialGoals || [])}
- Pekerjaan: ${user.profile?.occupation || "belum diisi"}

Transaksi bulan ini:
- Total pendapatan: Rp ${income.toLocaleString("id-ID")}
- Total pengeluaran: Rp ${expense.toLocaleString("id-ID")}
- Sisa: Rp ${(income - expense).toLocaleString("id-ID")}

Pengeluaran per kategori:
${Object.entries(expenseByCategory)
  .map(([cat, amt]) => `- ${cat}: Rp ${amt.toLocaleString("id-ID")}`)
  .join("\n")}

Anggaran yang ditetapkan:
${budgets
  .map((b) => `- ${b.category.name}: Rp ${Number(b.limitAmount).toLocaleString("id-ID")}/bulan`)
  .join("\n")}

Berikan 1 saran utama yang paling relevan dan spesifik berdasarkan data di atas. 
Saran harus konkret, menyebut angka, dan bisa langsung diterapkan.
Maksimal 3 kalimat.
`

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.content[0].text

  const suggestion = await prisma.aiSuggestion.create({
    data: {
      userId,
      type: "budgeting",
      content,
      metadata: { income, expense, expenseByCategory },
    },
  })

  return suggestion
}

export const getSuggestions = async (userId) => {
  return prisma.aiSuggestion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

export const updateSuggestion = async (userId, id, data) => {
  const existing = await prisma.aiSuggestion.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Saran tidak ditemukan")

  return prisma.aiSuggestion.update({
    where: { id },
    data: {
      ...(data.isRead !== undefined && { isRead: data.isRead }),
      ...(data.isApplied !== undefined && { isApplied: data.isApplied }),
    },
  })
}
