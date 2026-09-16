import { AtSign, Clock3, ShieldCheck, Store } from 'lucide-react'
import AvatarUploader from '../components/AvatarUploader.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { formatDateTime } from '../utils/formatters.js'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="truncate text-sm font-bold text-slate-800">{value || '-'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, business } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan akun"
        title="Profil Owner"
        description="Kelola foto profil dan perbarui identitas pemilik bisnis Anda."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
          <AvatarUploader className="mx-auto" />
        </section>

        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-sm font-extrabold text-slate-900">Informasi Akun</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Data akun dipakai untuk otorisasi akses web dan aplikasi Mobile.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoRow icon={AtSign} label="Email" value={user?.email} />
              <InfoRow icon={Store} label="Ruang usaha" value={business?.name} />
              <InfoRow icon={ShieldCheck} label="Hak akses" value="Owner" />
              <InfoRow icon={Clock3} label="Terdaftar sejak" value={formatDateTime(user?.created_at)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}