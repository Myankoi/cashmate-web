import { useCallback, useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Globe2, Plus, RotateCcw, SquarePen, Tags, Trash2 } from 'lucide-react'
import {
  createCategory,
  disableCategory,
  getCategories,
  restoreCategory,
  updateCategory,
} from '../api/categories.js'
import PageHeader from '../components/PageHeader.jsx'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormField,
  LoadingState,
  Modal,
  SegmentedTabs,
  SelectInput,
  StatusBadge,
  TextInput,
} from '../components/ui.jsx'
import { useToast } from '../hooks/useToast.js'
import { classNames } from '../utils/classNames.js'
import { isDeleted } from '../utils/formatters.js'

const statusTabs = [
  { value: 'active', label: 'Aktif' },
  { value: 'disabled', label: 'Nonaktif' },
  { value: 'all', label: 'Semua' },
]

function CategoryForm({ initialValue, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: initialValue?.name || '', type: initialValue?.type || 'income' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Nama kategori wajib diisi.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: form.name.trim(), type: form.type })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
      <FormField label="Nama Kategori" htmlFor="category-name" required>
        <TextInput
          id="category-name"
          autoFocus
          value={form.name}
          onChange={(event) => {
            setForm((current) => ({ ...current, name: event.target.value }))
            setError('')
          }}
          placeholder="Contoh: Penjualan Produk"
        />
      </FormField>
      <FormField label="Jenis Kategori" htmlFor="category-type" required>
        <SelectInput
          id="category-type"
          value={form.type}
          onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
        >
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </SelectInput>
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>Batal</Button>
        <Button type="submit" loading={submitting}>{initialValue ? 'Simpan Perubahan' : 'Tambah Kategori'}</Button>
      </div>
    </form>
  )
}

export default function CategoriesPage() {
  const { showToast } = useToast()
  const [status, setStatus] = useState('active')
  const [type, setType] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState(null)
  const [action, setAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await getCategories(status, type))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [status, type])

  useEffect(() => {
    const timeout = window.setTimeout(loadCategories, 0)
    return () => window.clearTimeout(timeout)
  }, [loadCategories])

  async function handleSave(payload) {
    if (formState?.item) {
      await updateCategory(formState.item.id, payload)
      showToast('Kategori berhasil diperbarui.')
    } else {
      await createCategory(payload)
      showToast('Kategori baru berhasil dibuat.')
    }
    setFormState(null)
    await loadCategories()
  }

  async function handleAction() {
    setActionLoading(true)
    try {
      if (action.type === 'disable') {
        await disableCategory(action.item.id)
        showToast('Kategori berhasil dinonaktifkan.')
      } else {
        await restoreCategory(action.item.id)
        showToast('Kategori berhasil dipulihkan.')
      }
      setAction(null)
      await loadCategories()
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Klasifikasi transaksi"
        title="Kategori"
        description="Kelompokkan pemasukan dan pengeluaran agar pencatatan kas tetap konsisten."
        action={
          <Button className="w-full sm:w-auto" onClick={() => setFormState({ mode: 'create' })}>
            <Plus className="h-4 w-4" /> Tambah Kategori
          </Button>
        }
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SegmentedTabs items={statusTabs} value={status} onChange={setStatus} />
        <SelectInput className="sm:w-52" value={type} onChange={(event) => setType(event.target.value)} aria-label="Jenis kategori">
          <option value="">Semua jenis</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </SelectInput>
      </section>

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCategories} />
      ) : !categories.length ? (
        <EmptyState
          icon={Tags}
          title="Belum ada kategori"
          description="Tambahkan kategori pemasukan atau pengeluaran untuk memulai."
          action={status !== 'disabled' && <Button size="sm" onClick={() => setFormState({ mode: 'create' })}>Tambah kategori</Button>}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const deleted = isDeleted(category.deleted_at)
            const global = category.business_id === null
            const income = category.type === 'income'
            const Icon = income ? ArrowUpRight : ArrowDownLeft
            return (
              <article key={category.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className={classNames('flex h-11 w-11 items-center justify-center rounded-xl', income ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {global && <StatusBadge active><Globe2 className="mr-1 h-3 w-3" /> Default</StatusBadge>}
                    {!global && <StatusBadge active={!deleted} />}
                  </div>
                </div>
                <h2 className="mt-5 text-base font-extrabold text-slate-900">{category.name}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">{income ? 'Kategori pemasukan' : 'Kategori pengeluaran'}</p>
                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                  {global ? (
                    <p className="text-xs leading-5 text-slate-400">Kategori bawaan tersedia untuk seluruh Business dan tidak dapat diubah.</p>
                  ) : !deleted ? (
                    <>
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => setFormState({ mode: 'edit', item: category })}>
                        <SquarePen className="h-4 w-4" /> Ubah
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAction({ type: 'disable', item: category })} aria-label="Nonaktifkan kategori">
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="soft" size="sm" className="w-full" onClick={() => setAction({ type: 'restore', item: category })}>
                      <RotateCcw className="h-4 w-4" /> Pulihkan Kategori
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      <Modal
        open={Boolean(formState)}
        onClose={() => setFormState(null)}
        title={formState?.item ? 'Ubah Kategori' : 'Tambah Kategori'}
        description="Jenis kategori harus sesuai dengan jenis transaksi yang akan dicatat."
        size="sm"
      >
        {formState && <CategoryForm initialValue={formState.item} onSubmit={handleSave} onCancel={() => setFormState(null)} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        tone={action?.type === 'disable' ? 'danger' : 'primary'}
        title={action?.type === 'disable' ? 'Nonaktifkan kategori?' : 'Pulihkan kategori?'}
        description={action?.type === 'disable' ? 'Kategori tidak dapat dipilih untuk transaksi baru. Histori lama tetap menyimpan referensinya.' : 'Kategori akan tersedia kembali untuk transaksi baru.'}
        confirmLabel={action?.type === 'disable' ? 'Nonaktifkan' : 'Pulihkan'}
      >
        {action && <p className="rounded-xl bg-slate-50 p-4 text-sm font-extrabold text-slate-800">{action.item.name}</p>}
      </ConfirmDialog>
    </div>
  )
}
