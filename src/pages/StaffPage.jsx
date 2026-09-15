import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Mail, Plus, Trash2, UserRound, Users } from 'lucide-react'
import { createStaff, disableStaff, getStaff } from '../api/staff.js'
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
  StatusBadge,
  TextInput,
} from '../components/ui.jsx'
import { useToast } from '../hooks/useToast.js'
import { formatDateTime, initials, isDeleted } from '../utils/formatters.js'

const statusTabs = [
  { value: 'active', label: 'Aktif' },
  { value: 'disabled', label: 'Nonaktif' },
  { value: 'all', label: 'Semua' },
]

function StaffForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.name.trim().length < 3) {
      setError('Nama Staff minimal 3 karakter.')
      return
    }
    if (!form.email.trim()) {
      setError('Email Staff wajib diisi.')
      return
    }
    if (form.password.length < 8) {
      setError('Password Staff minimal 8 karakter.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
      <FormField label="Nama Staff" htmlFor="staff-name" required>
        <div className="relative">
          <UserRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput id="staff-name" name="name" autoFocus value={form.name} onChange={updateField} placeholder="Nama lengkap Staff" className="pl-10" />
        </div>
      </FormField>
      <FormField label="Email" htmlFor="staff-email" required>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput id="staff-email" name="email" type="email" value={form.email} onChange={updateField} placeholder="staff@email.com" className="pl-10" />
        </div>
      </FormField>
      <FormField label="Password Awal" htmlFor="staff-password" required hint="Staff menggunakan akun ini untuk login melalui aplikasi Mobile.">
        <div className="relative">
          <TextInput id="staff-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField} placeholder="Minimal 8 karakter" className="pr-11" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>Batal</Button>
        <Button type="submit" loading={submitting}>Buat Akun Staff</Button>
      </div>
    </form>
  )
}

export default function StaffPage() {
  const { showToast } = useToast()
  const [status, setStatus] = useState('active')
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadStaff = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setStaff(await getStaff(status))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    const timeout = window.setTimeout(loadStaff, 0)
    return () => window.clearTimeout(timeout)
  }, [loadStaff])

  async function handleCreate(payload) {
    await createStaff(payload)
    setFormOpen(false)
    showToast('Akun Staff berhasil dibuat.')
    await loadStaff()
  }

  async function handleDisable() {
    setActionLoading(true)
    try {
      await disableStaff(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Akun Staff berhasil dinonaktifkan.')
      await loadStaff()
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tim usaha"
        title="Kelola Staff"
        description="Buat akun kasir untuk aplikasi Mobile tanpa membagikan akses Owner."
        action={
          <Button className="w-full sm:w-auto" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Tambah Staff
          </Button>
        }
      />

      <div className="flex justify-start">
        <SegmentedTabs items={statusTabs} value={status} onChange={setStatus} />
      </div>

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStaff} />
      ) : !staff.length ? (
        <EmptyState
          icon={Users}
          title={status === 'disabled' ? 'Tidak ada Staff nonaktif' : 'Belum ada Staff'}
          description="Buat akun Staff agar kasir dapat mencatat transaksi melalui aplikasi Mobile."
          action={status !== 'disabled' && <Button size="sm" onClick={() => setFormOpen(true)}>Tambah Staff</Button>}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => {
            const deleted = isDeleted(member.deleted_at)
            return (
              <article key={member.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                    {initials(member.name)}
                  </span>
                  <StatusBadge active={!deleted} />
                </div>
                <h2 className="mt-5 truncate text-base font-extrabold text-slate-900">{member.name}</h2>
                <p className="mt-1 truncate text-xs text-slate-500">{member.email}</p>
                <div className="mt-5 rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Dibuat</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{formatDateTime(member.created_at)}</p>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  {!deleted ? (
                    <Button variant="secondary" size="sm" className="w-full text-rose-600" onClick={() => setDeleteTarget(member)}>
                      <Trash2 className="h-4 w-4" /> Nonaktifkan Staff
                    </Button>
                  ) : (
                    <p className="text-center text-xs leading-5 text-slate-400">Akun nonaktif. Histori transaksi Staff tetap tersimpan.</p>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Tambah Staff" description="Akun selalu dibuat sebagai STAFF dan otomatis masuk ke Business Anda." size="sm">
        <StaffForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDisable}
        loading={actionLoading}
        title="Nonaktifkan akun Staff?"
        description="Staff akan langsung kehilangan akses. Transaksi yang pernah dibuat tetap tersedia dalam histori Owner."
        confirmLabel="Nonaktifkan Staff"
      >
        {deleteTarget && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-800">{deleteTarget.name}</p>
            <p className="mt-1 text-xs text-slate-500">{deleteTarget.email}</p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
