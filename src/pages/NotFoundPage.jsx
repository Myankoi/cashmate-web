import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand.jsx'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-center">
      <div>
        <div className="flex justify-center">
          <Brand />
        </div>
        <p className="mt-10 text-6xl font-black text-brand-100">404</p>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">Alamat yang Anda buka tidak tersedia.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>
    </main>
  )
}
