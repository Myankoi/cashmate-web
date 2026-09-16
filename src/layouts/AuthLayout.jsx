import authIllustration from '../assets/figma/auth-illustration.png'
import Brand from '../components/Brand.jsx'

export default function AuthLayout({ children }) {
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

            <div className="relative z-10 flex flex-1 items-center justify-center py-6">
              <img
                src={authIllustration}
                alt="Ilustrasi pengelolaan keuangan CashMate"
                className="w-full max-w-[360px] drop-shadow-xl"
                width="414"
                height="194"
              />
            </div>
          </section>

          <section className="flex min-h-[590px] flex-col p-6 sm:p-10 lg:p-12">
            <div className="mb-8 flex items-center justify-between lg:justify-end">
              <div className="lg:hidden">
                <Brand />
              </div>
            </div>
            <div className="my-auto">{children}</div>
          </section>
        </div>
      </div>
    </main>
  )
}
