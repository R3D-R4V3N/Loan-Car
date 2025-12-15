import { Payment } from '../types'

interface PaymentTableProps {
  payments: Payment[]
  onSelect: (payment: Payment) => void
  onToggle: (payment: Payment) => void
  canEdit: boolean
}

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('nl-NL') : '-')

export function PaymentTable({ payments, onSelect, onToggle, canEdit }: PaymentTableProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Maandelijkse betalingen</h3>
        <p className="text-sm text-slate-500">{canEdit ? 'Klik op een rij om te bewerken' : 'Alleen Jasper kan wijzigingen maken'}</p>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-header px-4 py-3">Maand</th>
              <th className="table-header px-4 py-3">Bedrag</th>
              <th className="table-header px-4 py-3">Status</th>
              <th className="table-header px-4 py-3">Betaald op</th>
              <th className="table-header px-4 py-3">Actie</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className={`table-row ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'}`}
                onClick={() => onSelect(payment)}
              >
                <td className="px-4 py-3 font-semibold text-slate-800">Maand {payment.month}</td>
                <td className="px-4 py-3">€{payment.amount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      payment.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {payment.status === 'PAID' ? 'Betaald' : 'Niet betaald'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(payment.paidAt)}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {canEdit ? (
                    <button
                      className={`rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors ${
                        payment.status === 'PAID'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                      }`}
                      onClick={() => onToggle(payment)}
                    >
                      {payment.status === 'PAID' ? 'Markeer als onbetaald' : 'Markeer als betaald'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Alleen Jasper kan aanpassen</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
