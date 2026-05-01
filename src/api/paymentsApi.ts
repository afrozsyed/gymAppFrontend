import axiosInstance from './axiosInstance'
import type { PaymentRequest, PaymentResponse } from '../types/payment.types'

export const paymentsApi = {
  record: (memberId: number, data: PaymentRequest) =>
    axiosInstance
      .post<PaymentResponse>(`/members/${memberId}/payments`, data)
      .then((r) => r.data),

  getHistory: (memberId: number) =>
    axiosInstance
      .get<PaymentResponse[]>(`/members/${memberId}/payments`)
      .then((r) => r.data),
}
