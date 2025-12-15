import axios from 'axios'
import { AuthResponse, LoanDetails, Payment, PaymentStatus } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('loan-token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
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

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', { username, password })
  return data
}
