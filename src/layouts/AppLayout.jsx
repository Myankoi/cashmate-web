import { useState } from 'react'
import {
  BookOpenText,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Tags,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import walletIllustration from '../assets/figma/wallet-illustration.png'
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

function Sidebar({ open, onClose, onLogout, loggingOut, collapsed, onToggle }) {
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
          'fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-[#0c46df] to-[#0734b8] text-white shadow-2xl shadow-brand-900/25 transition-[transform,width] duration-200 lg:translate-x-0 lg:shadow-none',
          collapsed ? 'w-[250px] lg:w-[76px]' : 'w-[250px]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div
          className={classNames(
            'flex h-20 items-center',
            collapsed
              ? 'justify-start gap-0 px-0 lg:h-28 lg:flex-col lg:justify-center lg:gap-1'
              : 'justify-between px-6',
          )}
        >
          <Brand inverse compact={collapsed} />
          <button
            type="button"
            className="hidden rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:inline-flex"
            onClick={onToggle}
            aria-label={collapsed ? 'Perluas navigasi' : 'Perkecil navigasi'}
            title={collapsed ? 'Perluas navigasi' : 'Perkecil navigasi'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={classNames('px-5 pt-4', collapsed && 'hidden')}>
          <p className="px-3 text-[10px] font-extrabold tracking-[0.18em] text-blue-200 uppercase">
            Navigasi utama
          </p>
        </div>
        <nav className={classNames('app-scrollbar mt-3 flex-1 space-y-1 overflow-y-auto', collapsed ? 'px-2' : 'px-4')}>
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
                    'flex min-h-11 items-center rounded-xl text-sm font-semibold transition',
                    collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                    isActive
                      ? 'bg-white/18 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white',
                  )
                }
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                <span className={classNames(collapsed && 'sr-only')}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className={classNames('px-4 pb-4', collapsed && 'hidden')}>
          <img
            src={walletIllustration}
            alt=""
            aria-hidden="true"
            className="mx-auto h-44 w-48 object-contain opacity-90"
            style={{
              maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
            }}
          />
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className={classNames(
              'flex min-h-11 w-full items-center rounded-xl text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white disabled:opacity-60',
              collapsed ? 'justify-center px-0' : 'gap-3 px-3',
            )}
            aria-label="Keluar"
            title={collapsed ? 'Keluar' : undefined}
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span className={classNames(collapsed && 'sr-only')}>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />
      <div className={classNames('transition-[padding] duration-200', sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[250px]')}>
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
            className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-slate-50"
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
