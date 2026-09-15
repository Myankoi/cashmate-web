import { ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { Button } from '../components/ui.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const { resetForbidden } = useAuth()

  function returnToLogin() {
    resetForbidden()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-12">
        <div className="flex justify-center">
          <Brand />
        </div>
        <span className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldX className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Akses Web khusus Owner</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Akun Staff hanya dapat menggunakan aplikasi Mobile. Sesi Web ini telah dibersihkan untuk
          menjaga akses data keuangan usaha.
        </p>
        <Button className="mt-7 w-full sm:w-auto" onClick={returnToLogin}>
          Kembali ke Login
        </Button>
      </div>
    </main>
  )
}
