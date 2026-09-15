import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays } from 'lucide-react'
import { classNames } from '../utils/classNames.js'
import {
  formatRupiahInput,
  parseRupiahInput,
  todayInJakarta,
} from '../utils/formatters.js'
import { Button, FormField, SelectInput, TextArea, TextInput } from './ui.jsx'

const emptyForm = {
  type: 'income',
  amount: '',
  wallet_id: '',
  category_id: '',
  date: todayInJakarta(),
  description: '',
}

function initialFormValue(initialValue) {
  if (!initialValue) return emptyForm
  return {
    type: initialValue.type,
    amount: initialValue.amount,
    wallet_id: String(initialValue.wallet_id),
    category_id: String(initialValue.category_id),
    date: initialValue.date || todayInJakarta(),
    description: initialValue.description || '',
  }
}

export default function TransactionForm({
  wallets,
  categories,
  initialValue,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Transaksi',
}) {
  const [form, setForm] = useState(() => initialFormValue(initialValue))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type],
  )

  function setType(type) {
    setForm((current) => ({ ...current, type, category_id: '' }))
    setError('')
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function updateAmount(event) {
    const value = parseRupiahInput(event.target.value)
    setForm((current) => ({ ...current, amount: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!Number.isSafeInteger(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Nominal harus berupa rupiah bulat dan lebih dari 0.')
      return
    }
    if (!form.wallet_id || !form.category_id || !form.date) {
      setError('Dompet, kategori, dan tanggal transaksi wajib dipilih.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        wallet_id: Number(form.wallet_id),
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        type: form.type,
        description: form.description.trim(),
        date: form.date,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <FormField label="Jenis Transaksi" required>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['income', 'Uang Masuk', ArrowUpRight],
            ['expense', 'Uang Keluar', ArrowDownLeft],
          ].map(([type, label, Icon]) => (
            <button
              key={type}
              type="button"
              onClick={() => setType(type)}
              className={classNames(
                'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition',
                form.type === type
                  ? type === 'income'
                    ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'border-rose-500 bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300',
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Nominal" htmlFor="amount" required hint="Gunakan angka rupiah tanpa desimal.">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-extrabold text-brand-700">Rp</span>
          <TextInput
            id="amount"
            name="amount"
            inputMode="numeric"
            placeholder="0"
            value={formatRupiahInput(form.amount)}
            onChange={updateAmount}
            className="pl-11 text-base font-extrabold"
          />
        </div>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Dompet / Kas" htmlFor="wallet_id" required>
          <SelectInput id="wallet_id" name="wallet_id" value={form.wallet_id} onChange={updateField}>
            <option value="">Pilih dompet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Kategori" htmlFor="category_id" required>
          <SelectInput id="category_id" name="category_id" value={form.category_id} onChange={updateField}>
            <option value="">Pilih kategori</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <FormField label="Tanggal Transaksi" htmlFor="date" required>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput id="date" name="date" type="date" value={form.date} onChange={updateField} className="pl-10" />
        </div>
      </FormField>

      <FormField label="Keterangan" htmlFor="description" optional>
        <TextArea
          id="description"
          name="description"
          maxLength={255}
          placeholder="Contoh: Penjualan produk retail hari ini"
          value={form.description}
          onChange={updateField}
        />
      </FormField>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Batal
          </Button>
        )}
        <Button type="submit" loading={submitting} className="sm:min-w-44">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
