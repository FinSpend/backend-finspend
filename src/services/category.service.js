import prisma from "../config/prisma.js"

const DEFAULT_CATEGORIES = [
  { name: "Gaji", type: "income", color: "#1D9E75", icon: "💼", isDefault: true, sortOrder: 0 },
  { name: "Freelance", type: "income", color: "#378ADD", icon: "💻", isDefault: true, sortOrder: 1 },
  { name: "Investasi", type: "income", color: "#639922", icon: "📈", isDefault: true, sortOrder: 2 },
  { name: "Makan & minum", type: "expense", color: "#7F77DD", icon: "🍜", isDefault: true, sortOrder: 3 },
  { name: "Transport", type: "expense", color: "#1D9E75", icon: "🚌", isDefault: true, sortOrder: 4 },
  { name: "Hiburan", type: "expense", color: "#D85A30", icon: "🎮", isDefault: true, sortOrder: 5 },
  { name: "Belanja", type: "expense", color: "#BA7517", icon: "🛍", isDefault: true, sortOrder: 6 },
  { name: "Tagihan", type: "expense", color: "#888780", icon: "📄", isDefault: true, sortOrder: 7 },
  { name: "Kesehatan", type: "expense", color: "#D4537E", icon: "🏥", isDefault: true, sortOrder: 8 },
  { name: "Pendidikan", type: "expense", color: "#378ADD", icon: "📚", isDefault: true, sortOrder: 9 },
]

export const getByUserId = async (userId) => {
  const defaultCategories = await prisma.category.findMany({
    where: { isDefault: true, userId: null },
    orderBy: { sortOrder: "asc" },
  })

  const userCategories = await prisma.category.findMany({
    where: { userId, isDefault: false },
    orderBy: { sortOrder: "asc" },
  })

  return [...defaultCategories, ...userCategories]
}

export const seedDefaults = async () => {
  const existing = await prisma.category.count({ where: { isDefault: true } })
  if (existing > 0) return

  await prisma.category.createMany({ data: DEFAULT_CATEGORIES })
}

export const create = async (userId, data) => {
  const { name, type, color, icon } = data

  const lastCategory = await prisma.category.findFirst({
    where: { userId },
    orderBy: { sortOrder: "desc" },
  })

  return prisma.category.create({
    data: {
      userId,
      name,
      type,
      color,
      icon,
      sortOrder: (lastCategory?.sortOrder ?? 0) + 1,
    },
  })
}

export const update = async (userId, id, data) => {
  const existing = await prisma.category.findFirst({
    where: { id, userId, isDefault: false },
  })
  if (!existing) throw new Error("Kategori tidak ditemukan atau tidak dapat diubah")

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
      ...(data.icon && { icon: data.icon }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  })
}

export const updateSortOrder = async (userId, items) => {
  const updates = items.map(({ id, sortOrder }) =>
    prisma.category.updateMany({
      where: { id, userId },
      data: { sortOrder },
    })
  )
  return Promise.all(updates)
}

export const remove = async (userId, id) => {
  const existing = await prisma.category.findFirst({
    where: { id, userId, isDefault: false },
  })
  if (!existing) throw new Error("Kategori tidak ditemukan atau tidak dapat dihapus")

  return prisma.category.delete({ where: { id } })
}
