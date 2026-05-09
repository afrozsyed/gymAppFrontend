import { useQuery } from '@tanstack/react-query'
import { reportApi } from '../api/reportApi'

export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportApi.getMonthly(year, month),
    staleTime: 60_000,
  })
}
