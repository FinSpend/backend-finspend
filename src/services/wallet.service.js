import prisma from "../config/prisma.js"

export const getByUserId = async (userId) => {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    include: {
      transactions: { select: { type: true, amount: true } },
      transfersOut: { select: { amount: true } },
      transfersIn:  { select: { amount: true } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })

  return wallets.map((w) => {
    const income = w.transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0)
    const expense = w.transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0)
    const transfersIn  = w.transfersIn.reduce((s, t) => s + Number(t.amount), 0)
    const transfersOut = w.transfersOut.reduce((s, t) => s + Number(t.amount), 0)
    const balance = Number(w.initialBalance) + income - expense + transfersIn - transfersOut

    const { transactions, transfersIn: _ti, transfersOut: _to, ...rest } = w
    return { ...rest, balance }
  })
}

export const create = async (userId, data) => {
  const { name, type, bankCode, color, icon, initialBalance, isDefault } = data

  if (isDefault) {
    await prisma.wallet.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  return prisma.wallet.create({
    data: {
      userId,
      name,
      type:           type           ?? "bank",
      bankCode:       bankCode       ?? null,
      color:          color          ?? null,
      icon:           icon           ?? null,
      initialBalance: initialBalance ?? 0,
      isDefault:      isDefault      ?? false,
    },
  })
}

export const update = async (userId, id, data) => {
  const existing = await prisma.wallet.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Wallet tidak ditemukan")

  if (data.isDefault) {
    await prisma.wallet.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  return prisma.wallet.update({
    where: { id },
    data: {
      ...(data.name           !== undefined && { name:           data.name }),
      ...(data.type           !== undefined && { type:           data.type }),
      ...(data.bankCode       !== undefined && { bankCode:       data.bankCode }),
      ...(data.color          !== undefined && { color:          data.color }),
      ...(data.icon           !== undefined && { icon:           data.icon }),
      ...(data.initialBalance !== undefined && { initialBalance: data.initialBalance }),
      ...(data.isDefault      !== undefined && { isDefault:      data.isDefault }),
    },
  })
}

export const remove = async (userId, id) => {
  const existing = await prisma.wallet.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Wallet tidak ditemukan")
  return prisma.wallet.delete({ where: { id } })
}

export const createTransfer = async (userId, data) => {
  const { fromWalletId, toWalletId, amount, note, transferDate } = data

  const [from, to] = await Promise.all([
    prisma.wallet.findFirst({ where: { id: fromWalletId, userId } }),
    prisma.wallet.findFirst({ where: { id: toWalletId,   userId } }),
  ])
  if (!from) throw new Error("Wallet sumber tidak ditemukan")
  if (!to)   throw new Error("Wallet tujuan tidak ditemukan")
  if (fromWalletId === toWalletId) throw new Error("Wallet sumber dan tujuan tidak boleh sama")

  return prisma.transfer.create({
    data: {
      userId,
      fromWalletId,
      toWalletId,
      amount,
      note:         note         ?? null,
      transferDate: new Date(transferDate),
    },
    include: { fromWallet: true, toWallet: true },
  })
}

export const getTransfers = async (userId) => {
  return prisma.transfer.findMany({
    where: { userId },
    include: { fromWallet: true, toWallet: true },
    orderBy: { transferDate: "desc" },
  })
}
