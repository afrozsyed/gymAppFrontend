import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '../api/paymentsApi'
import type { PaymentRequest } from '../types/payment.types'
import { memberKeys } from './useMembers'
import toast from 'react-hot-toast'

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: number; data: PaymentRequest }) =>
      paymentsApi.record(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() })
      toast.success('Membership renewed successfully!')
    },
    onError: () => toast.error('Failed to record payment'),
  })
}

export function usePaymentHistory(memberId: number) {
  return useQuery({
    queryKey: ['payments', memberId],
    queryFn: () => paymentsApi.getHistory(memberId),
    enabled: !!memberId,
  })
}
