import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, UploadCloud, X } from 'lucide-react'
import { classNames } from '../utils/classNames.js'
import {
  isSupportedImage,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
} from '../utils/uploads.js'

const MAX_PHOTOS = 10

export default function PhotoDropzone({
  onFilesChange,
  maxFiles = MAX_PHOTOS,
  className,
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const createdUrls = useRef(new Set())
  const [items, setItems] = useState([]) // { file, url }
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  useEffect(
    () => () => {
      createdUrls.current.forEach((url) => URL.revokeObjectURL(url))
      createdUrls.current.clear()
    },
    [],
  )

  function trackUrl(url) {
    createdUrls.current.add(url)
    return url
  }

  function pushFiles(fileList) {
    const selected = Array.from(fileList || [])
    const invalidTypeCount = selected.filter((file) => !isSupportedImage(file)).length
    const incoming = selected.filter(isSupportedImage)
    const oversizedCount = incoming.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES).length
    const candidates = incoming.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES && file.size > 0)
    const messages = []

    if (invalidTypeCount) messages.push('Hanya file JPG, PNG, atau WEBP yang dapat dilampirkan.')
    if (oversizedCount) messages.push('Setiap foto maksimal 5 MB.')
    if (!candidates.length) {
      setError(messages.join(' ') || 'Pilih minimal satu foto.')
      return
    }

    const remaining = maxFiles - items.length
    if (remaining <= 0) {
      setError(`Maksimal ${maxFiles} foto per transaksi.`)
      return
    }
    const existingSize = items.reduce((total, item) => total + item.file.size, 0)
    let acceptedSize = existingSize
    const accepted = []
    for (const file of candidates) {
      if (accepted.length >= remaining) break
      if (acceptedSize + file.size > MAX_TOTAL_UPLOAD_BYTES) continue
      accepted.push(file)
      acceptedSize += file.size
    }

    if (candidates.length > accepted.length) {
      messages.push('Total ukuran foto per kiriman maksimal 9 MB.')
    }
    if (!accepted.length) {
      setError(messages.join(' '))
      return
    }
    const nextItems = [
      ...items,
      ...accepted.map((file) => ({ file, url: trackUrl(URL.createObjectURL(file)) })),
    ]

    setItems(nextItems)
    setError(messages.join(' '))
    onFilesChange(nextItems.map((item) => item.file))
    if (incoming.length > remaining) {
      setError(`${messages.join(' ')} Maksimal ${maxFiles} foto per transaksi.`.trim())
    }
  }

  function removeItem(item) {
    URL.revokeObjectURL(item.url)
    createdUrls.current.delete(item.url)
    const nextItems = items.filter((entry) => entry !== item)
    setItems(nextItems)
    setError('')
    onFilesChange(nextItems.map((entry) => entry.file))
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragActive(false)
    pushFiles(event.dataTransfer?.files)
  }

  return (
    <div className={classNames('space-y-3', className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          pushFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={classNames(
          'focus-ring flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition',
          dragActive
            ? 'border-brand-500 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
        )}
        aria-label="Unggah bukti transaksi / struk"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
          {dragActive ? <UploadCloud className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
        </span>
        <span className="text-sm font-bold">Seret & lepas atau klik untuk pilih foto</span>
        <span className="text-xs font-medium text-slate-400">
          JPG, PNG, WEBP · maks. 5 MB/foto · total 9 MB
        </span>
      </button>

      {(Boolean(error) || items.length > 0) && (
        <div>
          {error && <p className="mb-2 text-xs font-medium text-rose-600">{error}</p>}
          {Boolean(items.length) && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.url}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  <img src={item.url} alt="Pratinjau bukti transaksi" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-rose-600"
                    aria-label="Hapus foto ini"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
