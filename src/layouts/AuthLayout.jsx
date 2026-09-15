import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import authIllustration from '../assets/figma/auth-illustration.png'
import Brand from '../components/Brand.jsx'

export default function AuthLayout({ mode, children }) {
  const isLogin = mode === 'login'
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <div className="auth-glow relative w-full max-w-[1040px] rounded-[32px] border border-slate-100 bg-white/65 p-3 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="relative z-10 grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_20px_60px_-20px_rgba(37,99,235,0.16)] lg:grid-cols-2">
          <section className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden border-r border-slate-100 bg-gradient-to-b from-slate-50 to-blue-50/50 p-10 lg:flex">
            <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/75" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-amber-100/75" />
            <div className="relative z-10">
              <Brand />
              <h1 className="mt-8 text-[27px] leading-tight font-extrabold tracking-tight text-slate-900">
                Simple Cash Management
                <br />
                for UMKM
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Kelola keuangan bisnis Anda dengan lebih mudah, cepat, dan praktis.
              </p>
            </div>

            <div className="relative z-10 flex justify-center py-6">
              <img
                src={authIllustration}
                alt="Ilustrasi pengelolaan keuangan CashMate"
                className="w-full max-w-[360px] drop-shadow-xl"
                width="414"
                height="194"
              />
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-slate-200/70 pt-5">
              {[
                [ShieldCheck, 'Aman'],
                [Zap, 'Mudah'],
                [BarChart3, 'Produktif'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[590px] flex-col p-6 sm:p-10 lg:p-12">
            <div className="mb-8 flex items-center justify-between lg:justify-end">
              <div className="lg:hidden">
                <Brand />
              </div>
              <Link
                to={isLogin ? '/register' : '/login'}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                {isLogin ? 'Daftar sekarang' : 'Masuk'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="my-auto">{children}</div>
          </section>
        </div>
      </div>
    </main>
  )
}
