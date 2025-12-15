import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { fetchLoan, fetchPayments, updatePayment } from './api'
import { Dashboard } from './components/Dashboard'
import { LoanCharts } from './components/LoanCharts'
import { Login } from './components/Login'
import { PaymentModal } from './components/PaymentModal'
import { PaymentTable } from './components/PaymentTable'
import { LoanDetails, Payment } from './types'

function App() {
  const [loan, setLoan] = useState<LoanDetails | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem('loan-token'))
  const [user, setUser] = useState<string>(localStorage.getItem('loan-user') || '')

  const loadData = async () => {
    try {
      setLoading(true)
      const [loanData, paymentData] = await Promise.all([fetchLoan(), fetchPayments()])
      setLoan(loanData)
      setPayments(paymentData)
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('loan-token')
        localStorage.removeItem('loan-auth')
        localStorage.removeItem('loan-user')
        setAuthenticated(false)
        setError('Sessie verlopen. Log opnieuw in om verder te gaan.')
        return
      }
      setError('Kon data niet laden. Controleer of de API draait op http://localhost:4000 en je bent ingelogd.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  const paidMonths = useMemo(() => payments.filter((p) => p.status === 'PAID').length, [payments])
  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )

  const derivedLoan = loan
    ? {
        ...loan,
        totalPaid,
        outstanding: Math.max(loan.principal - totalPaid, 0),
        percentPaid: (totalPaid / loan.principal) * 100,
        paidMonths,
      }
    : null

  const handleSavePayment = async (payload: { month: number; status: Payment['status']; paidAt?: string; note?: string }) => {
    try {
      await updatePayment(payload.month, { status: payload.status, paidAt: payload.paidAt, note: payload.note })
      await loadData()
      setSelectedPayment(null)
    } catch (err) {
      console.error(err)
      setError('Kon betaling niet bijwerken. Probeer het opnieuw.')
    }
  }

  const handleToggle = async (payment: Payment) => {
    const nextStatus = payment.status === 'PAID' ? 'UNPAID' : 'PAID'
    await handleSavePayment({ month: payment.month, status: nextStatus, paidAt: payment.paidAt ?? undefined, note: payment.note ?? undefined })
  }

  if (!authenticated) {
    return (
      <Login
        onLogin={(username) => {
          setAuthenticated(true)
          setUser(username)
        }}
      />
    )
  }

  if (loading || !derivedLoan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Data laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 grid gap-4 md:grid-cols-[1.3fr_1fr] items-start">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-indigo-600 font-semibold">Autolening</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Renteloze autolening dashboard</h1>
          <p className="text-slate-600">Beheer het leenbedrag van €20.000 over 60 maanden met realtime inzichten.</p>
          <p className="text-sm text-slate-500">Ingelogd als <span className="font-semibold text-slate-700">{user || 'onbekend'}</span></p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-white">
            <img
              src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80"
              alt="Zwarte BMW auto"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white space-y-1">
              <p className="text-xs uppercase tracking-[0.2em]">Auto financiering</p>
              <p className="text-lg font-semibold">BMW - rentevrij</p>
              <p className="text-sm opacity-90">Startdatum instelbaar, directe statusupdates</p>
            </div>
          </div>
          <div className="card px-4 py-3 bg-white shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-500">Openstaand</p>
              <p className="text-xl font-semibold text-indigo-700">€{derivedLoan.outstanding.toFixed(2)}</p>
            </div>
            <div className="text-sm text-slate-500">Maandbedrag €{derivedLoan.monthlyPayment.toFixed(2)}</div>
          </div>
        </div>
      </header>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700 border border-red-100">{error}</div>}

      <div className="space-y-6">
        <Dashboard loan={derivedLoan} />
        <LoanCharts loan={derivedLoan} payments={payments} />
        <PaymentTable payments={payments} onSelect={(payment) => setSelectedPayment(payment)} onToggle={handleToggle} />
      </div>

      <PaymentModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} onSave={handleSavePayment} />
    </div>
  )
}

export default App
