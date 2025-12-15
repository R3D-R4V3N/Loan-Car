import { LoanDetails } from '../types'

interface DashboardProps {
  loan: LoanDetails
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)

export function Dashboard({ loan }: DashboardProps) {
  const progress = Math.min(loan.percentPaid, 100)

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">Openstaand bedrag</p>
            <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(loan.outstanding)}</h2>
          </div>
          <span className="badge bg-slate-100 text-slate-700">{loan.remainingMonths} maanden te gaan</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Percentage afbetaald</span>
            <span className="font-semibold text-indigo-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-3 bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="card p-4 bg-indigo-50 border-indigo-100">
              <p className="text-slate-600">Totaal betaald</p>
              <p className="text-lg font-bold text-indigo-700">{formatCurrency(loan.totalPaid)}</p>
            </div>
            <div className="card p-4 bg-green-50 border-green-100">
              <p className="text-slate-600">Betaalde maanden</p>
              <p className="text-lg font-bold text-green-700">{loan.paidMonths} / {loan.totalMonths}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-slate-900 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-300">Totale lening</p>
            <h2 className="text-3xl font-bold">{formatCurrency(loan.principal)}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">Maandbedrag</p>
            <p className="text-xl font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
          <div>
            <p className="text-slate-400">Looptijd</p>
            <p className="font-semibold">{loan.totalMonths} maanden</p>
          </div>
          <div>
            <p className="text-slate-400">Resterend</p>
            <p className="font-semibold">{loan.remainingMonths} maanden</p>
          </div>
          <div>
            <p className="text-slate-400">Startdatum</p>
            <p className="font-semibold">{new Date(loan.startDate).toLocaleDateString('nl-NL')}</p>
          </div>
          <div>
            <p className="text-slate-400">Status</p>
            <p className="font-semibold">{progress >= 100 ? 'Volledig afbetaald' : 'Actief'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
