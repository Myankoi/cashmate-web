import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { assetUrl } from '../utils/assetUrl.js'

// Komponen diremount oleh pemanggil (via `key`) setiap kali dibuka pada
// indeks berbeda, sehingga urutan foto berganti menyesuaikan indeks awal.
export default function PhotoLightbox({ photos = [], index = -1, onClose }) {
  const [current, setCurrent] = useState(Math.max(0, index))

  useEffect(() => {
    if (index < 0 || !photos.length) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        setCurrent((value) => (value + 1) % photos.length)
      }
      if (event.key === 'ArrowLeft') {
        setCurrent((value) => (value - 1 + photos.length) % photos.length)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [index, onClose, photos.length])

  if (index < 0 || !photos.length) return null
  const photo = photos[current]

  function navigate(delta) {
    setCurrent((value) => (value + delta + photos.length) % photos.length)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto transaksi"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Tutup pratinjau"
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(-1)
          }}
          className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          aria-label="Foto sebelumnya"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <figure className="max-h-full max-w-full" onClick={(event) => event.stopPropagation()}>
        <img
          src={assetUrl(photo.url)}
          alt="Foto bukti transaksi"
          className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
      </figure>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(1)
          }}
          className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          aria-label="Foto berikutnya"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {photos.length > 1 && (
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white">
          {current + 1} / {photos.length}
        </p>
      )}
    </div>,
    document.body,
  )
}