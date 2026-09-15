import { useState } from 'react'
import { Building2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, FormField, TextInput } from '../components/ui.jsx'
import { useAuth } from '../hooks/useAuth.js'
import AuthLayout from '../layouts/AuthLayout.jsx'

const initialForm = {
  business_name: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.business_name.trim().length < 2) {
      setError('Nama usaha minimal 2 karakter.')
      return
    }
    if (form.name.trim().length < 3) {
      setError('Nama Owner minimal 3 karakter.')
      return
    }
    if (!form.email.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password belum sama.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        business_name: form.business_name.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      navigate('/login', {
        replace: true,
        state: { registered: true, email: form.email.trim().toLowerCase() },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    ['business_name', 'Nama Usaha', 'Contoh: Toko Makmur', Building2, 'organization'],
    ['name', 'Nama Owner', 'Nama lengkap pemilik', UserRound, 'name'],
    ['email', 'Email', 'nama@email.com', Mail, 'email'],
  ]

  return (
    <AuthLayout mode="register">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Daftar Akun</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Buat Business dan akun Owner untuk mulai menggunakan CashMate.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {fields.map(([name, label, placeholder, Icon, autoComplete]) => (
            <FormField key={name} label={label} htmlFor={name} required>
              <div className="relative">
                <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <TextInput
                  id={name}
                  name={name}
                  type={name === 'email' ? 'email' : 'text'}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={updateField}
                  className="pl-10"
                />
              </div>
            </FormField>
          ))}

          {['password', 'password_confirmation'].map((name) => (
            <FormField
              key={name}
              label={name === 'password' ? 'Password' : 'Konfirmasi Password'}
              htmlFor={name}
              required
            >
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <TextInput
                  id={name}
                  name={name}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={name === 'password' ? 'new-password' : 'off'}
                  placeholder={name === 'password' ? 'Minimal 8 karakter' : 'Ulangi password'}
                  value={form[name]}
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
          ))}

          <Button type="submit" loading={submitting} className="w-full">
            Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
