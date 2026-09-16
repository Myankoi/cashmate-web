import { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, LoaderCircle, X } from 'lucide-react'
import { updateProfilePhoto } from '../api/auth.js'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { assetUrl } from '../utils/assetUrl.js'
import { classNames } from '../utils/classNames.js'
import { initials } from '../utils/formatters.js'
import { Button } from './ui.jsx'

function previewFromFile(file) {
  return { file, url: URL.createObjectURL(file) }
}

export default function AvatarUploader({ className }) {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url)
    },
    [preview],
  )

  function selectFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar (JPG, PNG, WEBP) yang dapat diunggah.')
      return
    }
    setError('')
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return previewFromFile(file)
    })
  }

  function cancelPreview() {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return null
    })
    setError('')
  }

  async function handleUpload() {
    if (!preview) return
    setUploading(true)
    setError('')
    try {
      const updatedUser = await updateProfilePhoto(preview.file)
      updateUser(updatedUser)
      showToast('Foto profil berhasil diperbarui.')
      cancelPreview()
    } catch (requestError) {
      setError(requestError.message)
      showToast(requestError.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const photoUrl = preview?.url || assetUrl(user?.profile_photo)

  return (
    <div className={classNames('flex flex-col items-center text-center', className)}>
      <div className="relative">
        <div
          className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-brand-600 ring-4 ring-brand-100"
          aria-hidden="true"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-extrabold text-white">{initials(user?.name)}</span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50 text-white">
              <LoaderCircle className="h-7 w-7 animate-spin" />
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={selectFile}
          disabled={uploading}
        />
        {!uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={Boolean(preview)}
            className="focus-ring absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-700 shadow-md ring-1 ring-slate-200 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={preview ? 'Foto baru dipilih' : 'Ubah foto profil'}
          >
            <Camera className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {preview && (
        <div className="mt-4 flex items-center gap-2">
          <Button type="button" size="sm" loading={uploading} onClick={handleUpload}>
            <ImagePlus className="h-4 w-4" /> Simpan Foto
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={cancelPreview} disabled={uploading}>
            <X className="h-4 w-4" /> Batal
          </Button>
        </div>
      )}

      <p className="mt-3 text-sm font-extrabold text-slate-800">{user?.name}</p>
      <p className="text-xs font-medium text-slate-400">Owner</p>

      {error && <p className="mt-3 max-w-64 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}