import Brand from './Brand.jsx'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui.jsx'

export default function FullPageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="flex flex-col items-center gap-5">
        <Brand />
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        <p className="text-sm font-medium text-slate-500">Menyiapkan CashMate...</p>
      </div>
    </main>
  )
}

export function FullPageError({ message, onRetry }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <Brand />
        <AlertCircle className="mt-10 h-10 w-10 text-rose-500" />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Sesi belum dapat diperiksa</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <Button className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Coba lagi
        </Button>
      </div>
    </main>
  )
}
