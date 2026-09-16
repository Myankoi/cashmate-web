import logo from '../assets/figma/cashmate-logo.png'

export default function Brand({ compact = false, inverse = false }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="CashMate">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ${inverse ? 'bg-white/12' : 'bg-white shadow-sm ring-1 ring-slate-100'}`}
      >
        <img src={logo} alt="" className="h-7 w-7" width="28" height="28" />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight">
          <span className={inverse ? 'text-white' : 'text-brand-800'}>Cash</span>
          <span className="text-sun-500">Mate</span>
        </span>
      )}
    </div>
  )
}
