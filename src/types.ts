export type PaymentStatus = 'PAID' | 'UNPAID'

export interface Payment {
  id: number
  month: number
  amount: number
  status: PaymentStatus
  paidAt?: string | null
  note?: string | null
}

export interface LoanDetails {
  id: number
  principal: number
  monthlyPayment: number
  totalMonths: number
  startDate: string
  totalPaid: number
  outstanding: number
  percentPaid: number
  paidMonths: number
  remainingMonths: number
}

export interface AuthResponse {
  token: string
  username: string
}
