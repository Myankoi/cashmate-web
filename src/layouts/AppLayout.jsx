import { useState } from 'react'
import {
  BookOpenText,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Tags,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { assetUrl } from '../utils/assetUrl.js'
import { classNames } from '../utils/classNames.js'
import { initials } from '../utils/formatters.js'
import { ConfirmDialog } from '../components/ui.jsx'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Catat Transaksi', to: '/transactions/new', icon: PlusCircle },
  { label: 'Riwayat Transaksi', to: '/transactions', icon: BookOpenText },
  { label: 'Rekap Keuangan', to: '/reports', icon: ChartNoAxesCombined },
  { label: 'Dompet', to: '/wallets', icon: WalletCards },
  { label: 'Kategori', to: '/categories', icon: Tags },
  { label: 'Staff', to: '/staff', icon: Users },
  { label: 'Profil', to: '/profile', icon: UserRound },
]

function Sidebar({ open, onClose, onLogout, loggingOut }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col overflow-hidden bg-gradient-to-b from-[#0c46df] to-[#0734b8] text-white shadow-2xl shadow-brand-900/25 transition-transform duration-200 lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Brand inverse />
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <p className="px-3 text-[10px] font-extrabold tracking-[0.18em] text-blue-200 uppercase">
            Navigasi utama
          </p>
        </div>
        <nav className="app-scrollbar mt-3 flex-1 space-y-1 overflow-y-auto px-4">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/transactions'}
                onClick={onClose}
                className={({ isActive }) =>
                  classNames(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-white/18 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { user, business, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setLogoutDialogOpen(true)}
        loggingOut={loggingOut}
      />
      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-18 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            className="mr-3 rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-400">Ruang usaha</p>
            <p className="truncate text-sm font-extrabold text-slate-800">{business?.name}</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-2.5 py-2 shadow-sm transition hover:border-slate-200"
          >
            {user?.profile_photo ? (
              <img
                src={assetUrl(user.profile_photo)}
                alt="Foto profil"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                {initials(user?.name)}
              </span>
            )}
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-40 truncate text-xs font-extrabold text-slate-800">{user?.name}</p>
              <p className="text-[10px] font-semibold text-slate-400">Owner</p>
            </div>
          </Link>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <ConfirmDialog
        open={logoutDialogOpen}
        title="Keluar dari CashMate?"
        description="Sesi Anda akan diakhiri dan Anda perlu login kembali untuk mengakses data usaha."
        confirmLabel="Ya, keluar"
        onConfirm={handleLogout}
        onClose={() => setLogoutDialogOpen(false)}
        loading={loggingOut}
      />
    </div>
  )
}
