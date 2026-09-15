import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, FormField, TextInput } from '../components/ui.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import AuthLayout from '../layouts/AuthLayout.jsx'

const loginDebugEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === 'true'

function loginDebug(event, details = {}) {
  if (!loginDebugEnabled) return
  console.info(`[DEBUG-cashmate-login] ${event}`, details)
}

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' })
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (location.state?.registered) {
      showToast('Registrasi berhasil. Silakan masuk sebagai Owner.')
      navigate('/login', { replace: true, state: { email: location.state.email } })
    }
  }, [location.state, navigate, showToast])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setSubmitting(true)
    loginDebug('submit', {
      emailProvided: Boolean(form.email.trim()),
      passwordProvided: Boolean(form.password),
      remember,
    })
    try {
      const result = await login(
        { email: form.email.trim().toLowerCase(), password: form.password },
        remember,
      )
      loginDebug('result', { forbidden: Boolean(result?.forbidden) })
      if (result.forbidden) {
        navigate('/forbidden', { replace: true })
        return
      }
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (requestError) {
      loginDebug('error', {
        message: requestError.message,
        status: requestError.status || null,
        errorKeys:
          requestError.errors && typeof requestError.errors === 'object'
            ? Object.keys(requestError.errors)
            : [],
      })
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk ke CashMate</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Selamat datang kembali. Masuk untuk mengelola keuangan usaha Anda.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          <FormField label="Email" htmlFor="email" required>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={updateField}
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Password" htmlFor="password" required>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={updateField}
                className="pr-11 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <label className="flex w-fit items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-brand-600"
            />
            Ingat saya di perangkat ini
          </label>

          <Button type="submit" loading={submitting} className="w-full">
            Masuk
          </Button>
        </form>

        <p className="mt-7 text-center text-xs text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
