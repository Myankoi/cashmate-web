import Brand from './Brand.jsx'

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
