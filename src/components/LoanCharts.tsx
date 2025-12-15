import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LoanDetails, Payment } from '../types'

interface LoanChartsProps {
  loan: LoanDetails
  payments: Payment[]
}

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

export function LoanCharts({ loan, payments }: LoanChartsProps) {
  const monthlyData = payments
    .slice()
    .sort((a, b) => a.month - b.month)
    .map((payment, index) => {
      const paidSoFar = payments
        .filter((p) => p.month <= payment.month && p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0)
      const remaining = Math.max(loan.principal - paidSoFar, 0)
      return {
        name: `M${index + 1}`,
        remaining,
        paid: paidSoFar,
        unpaid: loan.principal - paidSoFar,
      }
    })

  const barData = payments.map((payment) => ({
    name: `M${payment.month}`,
    betaald: payment.status === 'PAID' ? payment.amount : 0,
    openstaand: payment.status === 'UNPAID' ? payment.amount : 0,
  }))

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="card p-6 h-[350px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resterend bedrag per maand</h3>
          <span className="text-sm text-slate-500">Line chart</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip formatter={(value: number) => currencyFormatter(value)} labelStyle={{ color: '#0f172a' }} />
            <Line type="monotone" dataKey="remaining" stroke="#6366f1" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-6 h-[350px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Betaald vs niet betaald</h3>
          <span className="text-sm text-slate-500">Bar chart</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tickFormatter={(value) => `€${value}`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip formatter={(value: number) => currencyFormatter(value)} labelStyle={{ color: '#0f172a' }} />
            <Legend />
            <Bar dataKey="betaald" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="openstaand" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
