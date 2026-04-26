import * as reportService from "../services/report.service.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const getReports = async (req, res) => {
  try {
    const data = await reportService.getByUserId(req.user.id)
    successResponse(res, data)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

export const generateReport = async (req, res) => {
  try {
    const { periodType, periodStart, periodEnd } = req.body
    if (!periodType || !periodStart || !periodEnd) {
      return errorResponse(res, "periodType, periodStart, dan periodEnd wajib diisi", 400)
    }

    const data = await reportService.generate(req.user.id, req.body)
    successResponse(res, data, "Laporan berhasil dibuat", 201)
  } catch (err) {
    errorResponse(res, err.message)
  }
}

// [PREMIUM]
export const downloadReport = async (req, res) => {
  try {
    const fileUrl = await reportService.getDownloadUrl(req.user.id, req.params.id)
    successResponse(res, { fileUrl }, "URL download berhasil didapat")
  } catch (err) {
    errorResponse(res, err.message, 404)
  }
}
