import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, RotateCcw, SquarePen, Trash2 } from 'lucide-react'
import { assetUrl } from '../utils/assetUrl.js'
import { classNames } from '../utils/classNames.js'
import { formatDate, formatIDR } from '../utils/formatters.js'
import PhotoLightbox from './PhotoLightbox.jsx'
import { Button, StatusBadge } from './ui.jsx'

export default function TransactionRow({ transaction, compact = false, onEdit, onVoid, onRestore }) {
  const income = transaction.type === 'income'
  const deleted = Boolean(transaction.deleted_at)
  const photos = transaction.photos || []
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  return (
    <article
      className={classNames(
        'flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition sm:flex-row sm:items-center',
        !compact && 'hover:border-slate-200 hover:shadow-sm',
        deleted && 'bg-slate-50/70 opacity-80',
      )}
    >
      <span
        className={classNames(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          income ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500',
        )}
      >
        {income ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-extrabold text-slate-800">
            {transaction.description || transaction.category?.name || 'Tanpa keterangan'}
          </h3>
          {deleted && <StatusBadge active={false}>Void</StatusBadge>}
        </div>
        <p className="mt-1 truncate text-xs text-slate-400">
          {transaction.category?.name || 'Kategori tidak tersedia'} ·{' '}
          {transaction.wallet?.name || 'Dompet tidak tersedia'}
          {transaction.created_by?.name ? ` · ${transaction.created_by.name}` : ''}
        </p>
        {photos.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {photos.slice(0, 3).map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="focus-ring group relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 transition hover:border-brand-300"
                aria-label="Lihat bukti transaksi"
              >
                <img
                  src={assetUrl(photo.url)}
                  alt="Bukti transaksi"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/10" />
              </button>
            ))}
            {photos.length > 3 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(3)}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-600 transition hover:border-brand-300"
                aria-label="Lihat semua bukti transaksi"
              >
                +{photos.length - 3}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
        <p className={classNames('text-sm font-extrabold', income ? 'text-emerald-600' : 'text-rose-500')}>
          {income ? '+' : '−'} {formatIDR(transaction.amount)}
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">{formatDate(transaction.date)}</p>
      </div>
      {!compact && (onEdit || onVoid || onRestore) && (
        <div className="flex items-center gap-1 border-t border-slate-100 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
          {!deleted && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)} aria-label="Edit transaksi">
              <SquarePen className="h-4 w-4" />
            </Button>
          )}
          {!deleted && onVoid && (
            <Button variant="ghost" size="sm" onClick={() => onVoid(transaction)} aria-label="Void transaksi">
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          )}
          {deleted && onRestore && (
            <Button variant="soft" size="sm" onClick={() => onRestore(transaction)}>
              <RotateCcw className="h-4 w-4" /> Pulihkan
            </Button>
          )}
        </div>
      )}

      <PhotoLightbox
        key={lightboxIndex}
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </article>
  )
}