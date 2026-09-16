const configuredBaseURL = import.meta.env.VITE_API_BASE_URL

// Mengubah nilai path aset (mis. "/uploads/avatars/1/x.jpg") yang dikembalikan
// backend menjadi URL absolut yang dapat dirender oleh <img>. URL absolut
// (sudah diawali http:// atau https://) langsung dipakai apa adanya.
export function assetUrl(value) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  try {
    return new URL(value, configuredBaseURL).toString()
  } catch {
    return value
  }
}