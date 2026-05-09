import axiosInstance from './axiosInstance'
import type { ReportResponse, YearlyReport } from '../types/report.types'

export const reportApi = {
  getMonthly: (year: number, month: number): Promise<ReportResponse> =>
    axiosInstance.get('/reports/monthly', { params: { year, month } }).then(r => r.data),
  getYearly: (year: number): Promise<YearlyReport> =>
    axiosInstance.get('/reports/yearly', { params: { year } }).then(r => r.data),
  getRange: (start: string, end: string): Promise<ReportResponse> =>
    axiosInstance.get('/reports/range', { params: { start, end } }).then(r => r.data),
}
