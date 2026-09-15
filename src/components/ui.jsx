import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LoaderCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import { classNames } from '../utils/classNames.js'

const buttonVariants = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-400',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-500',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55',
        size === 'sm' ? 'min-h-9 px-3 text-xs' : 'min-h-11 px-4 text-sm',
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function FormField({ label, htmlFor, required, optional, hint, error, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {optional && <span className="text-[11px] font-medium text-slate-400">Opsional</span>}
      </div>
      {children}
      {(error || hint) && (
        <p className={classNames('text-xs', error ? 'text-rose-600' : 'text-slate-500')}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

const controlClass =
  'focus-ring min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

export function TextInput({ className, ...props }) {
  return <input className={classNames(controlClass, className)} {...props} />
}

export function SelectInput({ className, children, ...props }) {
  return (
    <select className={classNames(controlClass, 'appearance-auto', className)} {...props}>
      {children}
    </select>
  )
}

export function TextArea({ className, ...props }) {
  return (
    <textarea
      className={classNames(controlClass, 'min-h-24 resize-y py-3', className)}
      {...props}
    />
  )
}

export function Modal({ open, title, description, onClose, children, footer, size = 'md' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={classNames(
          'modal-enter max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl',
          widths[size],
        )}
      >
        <header className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id="modal-title" className="text-lg font-extrabold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="app-scrollbar max-h-[calc(92vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  loading,
  tone = 'danger',
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-extrabold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center">
      <AlertCircle className="h-9 w-9 text-rose-500" />
      <h3 className="mt-3 font-extrabold text-slate-800">Data belum dapat dimuat</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Coba lagi
        </Button>
      )}
    </div>
  )
}

export function LoadingState({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-label="Memuat data">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/80"
        />
      ))}
    </div>
  )
}

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-500">
        Menampilkan <strong className="text-slate-700">{meta.from}-{meta.to}</strong> dari{' '}
        <strong className="text-slate-700">{meta.total}</strong>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        <span className="min-w-20 text-center text-xs font-bold text-slate-600">
          {meta.current_page} / {meta.last_page}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Berikutnya <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function SegmentedTabs({ items, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={classNames(
            'rounded-lg px-3 py-2 text-xs font-bold transition',
            value === item.value
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function StatusBadge({ active, children }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
      )}
    >
      {children || (active ? 'Aktif' : 'Nonaktif')}
    </span>
  )
}
