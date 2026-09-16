import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { classNames } from '../utils/classNames.js'
import { assetUrl } from '../utils/assetUrl.js'
import {
  formatRupiahInput,
  parseRupiahInput,
  todayInJakarta,
} from '../utils/formatters.js'
import PhotoDropzone from './PhotoDropzone.jsx'
import { Button, FormField, SelectInput, TextArea, TextInput } from './ui.jsx'

const emptyForm = {
  type: 'income',
  amount: '',
  wallet_id: '',
  category_id: '',
  date: todayInJakarta(),
  description: '',
}

function initialFormValue(initialValue, defaultType) {
  if (!initialValue) return { ...emptyForm, type: defaultType }
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
  defaultType = 'income',
}) {
  const [form, setForm] = useState(() => initialFormValue(initialValue, defaultType))
  const [amountInput, setAmountInput] = useState(() => formatRupiahInput(initialValue?.amount ?? ''))
  const [photoFiles, setPhotoFiles] = useState([])
  const [removedPhotoIds, setRemovedPhotoIds] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const existingPhotos = initialValue?.photos || []

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
    const rawValue = event.target.value
    const value = parseRupiahInput(rawValue)
    setAmountInput(rawValue)
    setForm((current) => ({ ...current, amount: value === null ? '' : value }))
    if (value === null && rawValue.trim()) {
      setError('Nominal hanya boleh berisi angka rupiah bulat, tanpa desimal atau minus.')
      return
    }
    setError('')
  }

  function formatAmountOnBlur() {
    const value = parseRupiahInput(amountInput)
    if (typeof value === 'number') setAmountInput(formatRupiahInput(value))
  }

  function removeExistingPhoto(photoId) {
    setRemovedPhotoIds((current) =>
      current.includes(photoId) ? current : [...current, photoId],
    )
  }

  function restoreExistingPhoto(photoId) {
    setRemovedPhotoIds((current) => current.filter((id) => id !== photoId))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const amount = parseRupiahInput(amountInput)
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setError('Nominal harus berupa rupiah bulat dan lebih dari 0.')
      return
    }
    if (!form.wallet_id || !form.category_id || !form.date || !availableCategories.length) {
      setError('Dompet, kategori, dan tanggal transaksi wajib dipilih.')
      return
    }
    const payload = {
      wallet_id: Number(form.wallet_id),
      category_id: Number(form.category_id),
      amount,
      type: form.type,
      description: form.description.trim(),
      date: form.date,
    }
    if (photoFiles.length) payload.photos = photoFiles
    if (removedPhotoIds.length) payload.remove_photos = removedPhotoIds
    setSubmitting(true)
    try {
      await onSubmit(payload)
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
            value={amountInput}
            onChange={updateAmount}
            onBlur={formatAmountOnBlur}
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

      {!availableCategories.length && (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Belum ada kategori untuk transaksi ini.{' '}
          <Link to="/categories" className="font-extrabold underline underline-offset-2">
            Kelola kategori
          </Link>
        </p>
      )}

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

      <FormField label="Unggah Bukti Transaksi / Struk" optional>
        <PhotoDropzone onFilesChange={setPhotoFiles} />

        {existingPhotos.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-slate-700">
              Foto tersimpan
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {existingPhotos.map((photo) => {
                const pendingRemoval = removedPhotoIds.includes(photo.id)
                return (
                  <div
                    key={photo.id}
                    className={classNames(
                      'group relative aspect-square overflow-hidden rounded-xl border bg-slate-100 transition',
                      pendingRemoval ? 'border-rose-200 opacity-60' : 'border-slate-200',
                    )}
                  >
                    <img
                      src={assetUrl(photo.url)}
                      alt="Foto bukti transaksi"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        pendingRemoval
                          ? restoreExistingPhoto(photo.id)
                          : removeExistingPhoto(photo.id)
                      }
                      className={classNames(
                        'absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm transition',
                        pendingRemoval
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-slate-900/70 hover:bg-rose-600',
                      )}
                      aria-label={pendingRemoval ? 'Batalkan penghapusan foto' : 'Hapus foto ini'}
                    >
                      {pendingRemoval ? <span className="text-[10px] font-extrabold">OK</span> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                    {pendingRemoval && (
                      <span className="absolute right-1 bottom-1 left-1 rounded-md bg-rose-600 px-1 py-0.5 text-center text-[10px] font-extrabold text-white">
                        Akan dihapus
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <X className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
              Foto yang ditandai akan dihapus setelah transaksi disimpan.
            </p>
          </div>
        )}
      </FormField>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Batal
          </Button>
        )}
        <Button
          type="submit"
          loading={submitting}
          disabled={!availableCategories.length}
          className="sm:min-w-44"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}