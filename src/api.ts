import axios from 'axios'
import { LoanDetails, Payment, PaymentStatus } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

export const fetchLoan = async (): Promise<LoanDetails> => {
  const { data } = await api.get<LoanDetails>('/loan')
  return data
}

export const fetchPayments = async (): Promise<Payment[]> => {
  const { data } = await api.get<Payment[]>('/payments')
  return data
}

export const updatePayment = async (
  month: number,
  payload: { status: PaymentStatus; paidAt?: string; note?: string }
): Promise<Payment> => {
  const { data } = await api.post<Payment>(`/payments/${month}`, payload)
  return data
}
