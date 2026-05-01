export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER'

export interface PaymentRequest {
  planId: number
  amount: number
  paymentMode: PaymentMode
  notes?: string
}

export interface PaymentResponse {
  id: number
  amount: number
  paymentMode: PaymentMode
  notes?: string
  paymentDate: string
  status: string
  planName?: string
}
