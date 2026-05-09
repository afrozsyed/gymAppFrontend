import axiosInstance from './axiosInstance'
import type { ReportResponse } from '../types/report.types'

export const reportApi = {
  getMonthly: (year: number, month: number): Promise<ReportResponse> =>
    axiosInstance.get('/reports/monthly', { params: { year, month } }).then(r => r.data),
}
