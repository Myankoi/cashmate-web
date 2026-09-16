const configuredBaseURL = import.meta.env?.VITE_API_BASE_URL

// Mengubah nilai path aset (mis. "/uploads/avatars/1/x.jpg") yang dikembalikan
// backend menjadi URL absolut yang dapat dirender oleh <img>. URL absolut
// (sudah diawali http:// atau https://) langsung dipakai apa adanya.
export function resolveAssetUrl(value, baseURL) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  try {
    const apiUrl = new URL(baseURL)
    const apiPath = apiUrl.pathname.replace(/\/$/, '')
    const publicPrefix = apiPath.replace(/\/api$/, '')
    const assetPath = value.startsWith('/') ? value : `/${value}`
    return new URL(`${publicPrefix}${assetPath}`, apiUrl.origin).toString()
  } catch {
    return value
  }
}

export function assetUrl(value) {
  return resolveAssetUrl(value, configuredBaseURL)
}
