import * as walletService from "../services/wallet.service.js"

export const getWallets = async (req, res) => {
  try {
    const data = await walletService.getByUserId(req.user.id)
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createWallet = async (req, res) => {
  try {
    const data = await walletService.create(req.user.id, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateWallet = async (req, res) => {
  try {
    const data = await walletService.update(req.user.id, req.params.id, req.body)
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteWallet = async (req, res) => {
  try {
    await walletService.remove(req.user.id, req.params.id)
    res.status(200).json({ success: true, message: "Wallet berhasil dihapus" })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const transfer = async (req, res) => {
  try {
    const data = await walletService.createTransfer(req.user.id, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getTransfers = async (req, res) => {
  try {
    const data = await walletService.getTransfers(req.user.id)
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
