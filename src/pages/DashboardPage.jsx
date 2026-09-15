import { useCallback, useEffect, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '../api/dashboard.js'
import { getMonthlyReport } from '../api/reports.js'
import MonthlyChart from '../components/MonthlyChart.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TransactionRow from '../components/TransactionRow.jsx'
import { Button, ErrorState, LoadingState } from '../components/ui.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { classNames } from '../utils/classNames.js'
import { formatIDR, todayInJakarta } from '../utils/formatters.js'

const metricStyles = {
  balance: ['bg-blue-50/65 border-blue-100', 'bg-brand-600 text-white', 'text-brand-700'],
  income: ['bg-emerald-50/60 border-emerald-100', 'bg-emerald-500 text-white', 'text-emerald-700'],
  expense: ['bg-rose-50/60 border-rose-100', 'bg-rose-500 text-white', 'text-rose-600'],
  net: ['bg-amber-50/60 border-amber-100', 'bg-sun-500 text-white', 'text-amber-700'],
}

function MetricCard({ label, value, icon: Icon, tone }) {
  const style = metricStyles[tone]
  return (
    <article className={classNames('rounded-2xl border p-5', style[0])}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600">{label}</p>
        <span className={classNames('flex h-9 w-9 items-center justify-center rounded-xl', style[1])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className={classNames('mt-5 text-xl font-extrabold tracking-tight', style[2])}>{formatIDR(value)}</p>
    </article>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const year = Number(todayInJakarta().slice(0, 4))

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryData, reportData] = await Promise.all([
        getDashboardSummary(),
        getMonthlyReport(year),
      ])
      setSummary(summaryData)
      setReport(reportData)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    const timeout = window.setTimeout(loadDashboard, 0)
    return () => window.clearTimeout(timeout)
  }, [loadDashboard])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan usaha"
        title={`Selamat datang, ${user?.name?.split(' ')[0] || 'Owner'}! 👋`}
        description="Pantau posisi kas dan aktivitas terbaru bisnis Anda dari satu tempat."
        action={
          <Link to="/transactions/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Catat Transaksi
            </Button>
          </Link>
        }
      />

      {loading ? (
        <LoadingState rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadDashboard} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Saldo Saat Ini" value={summary.total_balance} icon={Wallet} tone="balance" />
            <MetricCard
              label="Uang Masuk Bulan Ini"
              value={summary.current_month_income}
              icon={ArrowUpRight}
              tone="income"
            />
            <MetricCard
              label="Uang Keluar Bulan Ini"
              value={summary.current_month_expense}
              icon={ArrowDownRight}
              tone="expense"
            />
            <MetricCard label="Arus Kas Bersih" value={summary.net_cashflow} icon={CircleDollarSign} tone="net" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-extrabold text-slate-900">Grafik Keuangan</h2>
                  <p className="mt-1 text-xs text-slate-400">Pergerakan kas sepanjang {year}</p>
                </div>
                <Link to="/reports" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                  Lihat rekap <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </div>
              <MonthlyChart data={report} />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-slate-900">Transaksi Terbaru</h2>
                  <p className="mt-1 text-xs text-slate-400">{summary.transaction_count} transaksi aktif</p>
                </div>
                <ReceiptText className="h-5 w-5 text-brand-500" />
              </div>
              {summary.latest_transactions.length ? (
                <div className="space-y-3">
                  {summary.latest_transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} compact />
                  ))}
                  <Link
                    to="/transactions"
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-brand-600 hover:bg-brand-50"
                  >
                    Lihat semua transaksi <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                  <p className="text-sm font-bold text-slate-700">Belum ada transaksi</p>
                  <p className="mt-1 text-xs text-slate-400">Catat pemasukan atau pengeluaran pertama.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
