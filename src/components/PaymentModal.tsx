import { useEffect, useState } from 'react'
import { Payment, PaymentStatus } from '../types'

interface PaymentModalProps {
  payment: Payment | null
  onClose: () => void
  onSave: (payload: { month: number; status: PaymentStatus; paidAt?: string; note?: string }) => void
}

export function PaymentModal({ payment, onClose, onSave }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('UNPAID')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (payment) {
      setStatus(payment.status)
      setDate(payment.paidAt ? payment.paidAt.substring(0, 10) : '')
      setNote(payment.note ?? '')
    }
  }, [payment])

  if (!payment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="card w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">Maand {payment.month}</p>
            <h3 className="text-2xl font-semibold text-slate-900">{payment.amount.toFixed(2)} EUR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={status === 'PAID'}
              onChange={(e) => setStatus(e.target.checked ? 'PAID' : 'UNPAID')}
              className="h-4 w-4"
            />
            Betaald
          </label>

          <div className="grid gap-2">
            <label className="text-sm text-slate-600">Datum betaling</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={status === 'UNPAID'}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-600">Notitie (optioneel)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Bijvoorbeeld: vooruitbetaling of vertraagd"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button className="btn-secondary" onClick={onClose} type="button">
            Annuleren
          </button>
          <button
            className="btn-primary"
            onClick={() => onSave({ month: payment.month, status, paidAt: date || undefined, note })}
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  )
}
