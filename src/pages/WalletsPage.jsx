import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, RotateCcw, SquarePen, Trash2, WalletCards } from 'lucide-react'
import walletIllustration from '../assets/figma/wallet-illustration.png'
import {
  createWallet,
  disableWallet,
  getWallets,
  restoreWallet,
  updateWallet,
} from '../api/wallets.js'
import PageHeader from '../components/PageHeader.jsx'
import {
  Button,
  ConfirmDialog,
  ErrorState,
  FormField,
  LoadingState,
  Modal,
  SegmentedTabs,
  StatusBadge,
  TextInput,
} from '../components/ui.jsx'
import { useToast } from '../hooks/useToast.js'
import { formatIDR, isDeleted } from '../utils/formatters.js'

const statusTabs = [
  { value: 'active', label: 'Aktif' },
  { value: 'disabled', label: 'Nonaktif' },
  { value: 'all', label: 'Semua' },
]

function WalletForm({ initialValue, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValue?.name || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Nama dompet wajib diisi.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), currency: 'IDR' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
      <FormField label="Nama Dompet / Kas" htmlFor="wallet-name" required hint="Saldo hanya berubah melalui transaksi.">
        <TextInput
          id="wallet-name"
          autoFocus
          maxLength={255}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          placeholder="Contoh: Laci Kasir Utama"
        />
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>Batal</Button>
        <Button type="submit" loading={submitting}>
          {initialValue ? 'Simpan Perubahan' : 'Tambah Dompet'}
        </Button>
      </div>
    </form>
  )
}

export default function WalletsPage() {
  const { showToast } = useToast()
  const [status, setStatus] = useState('active')
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState(null)
  const [action, setAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const requestVersion = useRef(0)

  const loadWallets = useCallback(async () => {
    const requestVersionAtStart = ++requestVersion.current
    setLoading(true)
    setError('')
    try {
      const data = await getWallets(status)
      if (requestVersionAtStart !== requestVersion.current) return
      setWallets(data)
    } catch (requestError) {
      if (requestVersionAtStart !== requestVersion.current) return
      setError(requestError.message)
    } finally {
      if (requestVersionAtStart === requestVersion.current) setLoading(false)
    }
  }, [status])

  useEffect(() => {
    const timeout = window.setTimeout(loadWallets, 0)
    return () => window.clearTimeout(timeout)
  }, [loadWallets])

  const visibleBalance = useMemo(
    () => wallets.reduce((total, wallet) => total + Number(wallet.balance || 0), 0),
    [wallets],
  )

  async function handleSave(payload) {
    if (formState?.item) {
      await updateWallet(formState.item.id, payload)
      showToast('Dompet berhasil diperbarui.')
    } else {
      await createWallet({ name: payload.name })
      showToast('Dompet baru berhasil dibuat.')
    }
    setFormState(null)
    await loadWallets()
  }

  async function handleAction() {
    setActionLoading(true)
    try {
      if (action.type === 'disable') {
        await disableWallet(action.item.id)
        showToast('Dompet berhasil dinonaktifkan.')
      } else {
        await restoreWallet(action.item.id)
        showToast('Dompet berhasil dipulihkan.')
      }
      setAction(null)
      await loadWallets()
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sumber kas"
        title="Dompet & Kas"
        description="Pisahkan kas fisik dan rekening usaha. Saldo dikelola otomatis dari ledger transaksi."
        action={
          <Button className="w-full sm:w-auto" onClick={() => setFormState({ mode: 'create' })}>
            <Plus className="h-4 w-4" /> Tambah Dompet
          </Button>
        }
      />

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 to-brand-600 p-6 text-white shadow-lg shadow-brand-900/15">
        <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-[11px] font-bold tracking-[0.14em] text-blue-100 uppercase">Saldo pada daftar ini</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatIDR(visibleBalance)}</p>
          <p className="mt-2 text-xs text-blue-100">{wallets.length} dompet · Mata uang tetap IDR</p>
        </div>
      </section>

      <div className="flex justify-start">
        <SegmentedTabs items={statusTabs} value={status} onChange={setStatus} />
      </div>

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadWallets} />
      ) : !wallets.length ? (
        <section className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center shadow-sm sm:flex-row sm:justify-center sm:gap-10 sm:px-10 sm:py-10 sm:text-left">
          <img
            src={walletIllustration}
            alt="Ilustrasi dompet dan pertumbuhan kas"
            className="h-44 w-52 shrink-0 object-contain sm:h-48 sm:w-56"
            width="520"
            height="479"
          />
          <div className="max-w-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:mx-0">
              <WalletCards className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {status === 'disabled' ? 'Tidak ada dompet nonaktif' : 'Belum ada dompet'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tambahkan dompet untuk memisahkan sumber dan lokasi kas usaha.
            </p>
            {status !== 'disabled' && (
              <Button size="sm" className="mt-5" onClick={() => setFormState({ mode: 'create' })}>
                <Plus className="h-4 w-4" /> Tambah dompet
              </Button>
            )}
          </div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map((wallet) => {
            const deleted = isDeleted(wallet.deleted_at)
            return (
              <article key={wallet.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <WalletCards className="h-5 w-5" />
                  </span>
                  <StatusBadge active={!deleted} />
                </div>
                <h2 className="mt-5 truncate text-base font-extrabold text-slate-900">{wallet.name}</h2>
                <p className="mt-1 text-xs text-slate-400">Dompet usaha · {wallet.currency}</p>
                <p className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">{formatIDR(wallet.balance)}</p>
                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                  {!deleted ? (
                    <>
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => setFormState({ mode: 'edit', item: wallet })}>
                        <SquarePen className="h-4 w-4" /> Ubah Nama
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAction({ type: 'disable', item: wallet })} aria-label="Nonaktifkan dompet">
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="soft" size="sm" className="w-full" onClick={() => setAction({ type: 'restore', item: wallet })}>
                      <RotateCcw className="h-4 w-4" /> Pulihkan Dompet
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
        title={formState?.item ? 'Ubah Nama Dompet' : 'Tambah Dompet Baru'}
        description="Dompet baru dimulai dengan saldo Rp 0. Saldo tidak dapat diedit langsung."
        size="sm"
      >
        {formState && (
          <WalletForm initialValue={formState.item} onSubmit={handleSave} onCancel={() => setFormState(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        tone={action?.type === 'disable' ? 'danger' : 'primary'}
        title={action?.type === 'disable' ? 'Nonaktifkan dompet?' : 'Pulihkan dompet?'}
        description={
          action?.type === 'disable'
            ? 'Dompet tidak dapat dipilih untuk transaksi baru, tetapi histori dan saldonya tetap tersimpan.'
            : 'Dompet akan tersedia kembali untuk transaksi baru.'
        }
        confirmLabel={action?.type === 'disable' ? 'Nonaktifkan' : 'Pulihkan'}
      >
        {action && <p className="rounded-xl bg-slate-50 p-4 text-sm font-extrabold text-slate-800">{action.item.name}</p>}
      </ConfirmDialog>
    </div>
  )
}
