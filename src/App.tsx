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
  const [authenticated, setAuthenticated] = useState<boolean>(localStorage.getItem('loan-auth') === 'true')

  const loadData = async () => {
    try {
      setLoading(true)
      const [loanData, paymentData] = await Promise.all([fetchLoan(), fetchPayments()])
      setLoan(loanData)
      setPayments(paymentData)
    } catch (err) {
      console.error(err)
      setError('Kon data niet laden. Controleer of de API draait op http://localhost:4000')
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
    return <Login onLogin={() => setAuthenticated(true)} />
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
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-indigo-600 font-semibold">Persoonlijke lening</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Renteloze lening dashboard</h1>
          <p className="text-slate-600">Volledige controle over 20.000 EUR, 60 maanden, maandbedrag €330.</p>
        </div>
        <div className="card px-4 py-3 bg-white shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500">Openstaand</p>
          <p className="text-xl font-semibold text-indigo-700">€{derivedLoan.outstanding.toFixed(2)}</p>
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
