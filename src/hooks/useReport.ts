import { useQuery } from '@tanstack/react-query'
import { reportApi } from '../api/reportApi'

export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportApi.getMonthly(year, month),
    staleTime: 60_000,
  })
}

export function useYearlyReport(year: number) {
  return useQuery({
    queryKey: ['reports', 'yearly', year],
    queryFn: () => reportApi.getYearly(year),
    staleTime: 60_000,
  })
}

export function useRangeReport(start: string, end: string, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'range', start, end],
    queryFn: () => reportApi.getRange(start, end),
    staleTime: 60_000,
    enabled,
  })
}
