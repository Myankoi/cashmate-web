import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleDollarSign, FileBarChart2 } from 'lucide-react'
import { getMonthlyReport } from '../api/reports.js'
import MonthlyChart from '../components/MonthlyChart.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState, ErrorState, LoadingState, TextInput } from '../components/ui.jsx'
import { classNames } from '../utils/classNames.js'
import { formatIDR, monthNames, todayInJakarta } from '../utils/formatters.js'

function SummaryCard({ label, value, icon: Icon, tone }) {
  const styles = {
    income: 'bg-emerald-50 text-emerald-600',
    expense: 'bg-rose-50 text-rose-500',
    net: 'bg-brand-50 text-brand-600',
  }
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className={classNames('flex h-10 w-10 items-center justify-center rounded-xl', styles[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <p className="mt-1 truncate text-lg font-extrabold text-slate-900">{formatIDR(value)}</p>
        </div>
      </div>
    </article>
  )
}

export default function ReportsPage() {
  const currentYear = Number(todayInJakarta().slice(0, 4))
  const [year, setYear] = useState(currentYear)
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    if (!Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 9999) {
      setError('Tahun harus berada antara 1 dan 9999.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      setReport(await getMonthlyReport(Number(year)))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    const timeout = window.setTimeout(loadReport, 0)
    return () => window.clearTimeout(timeout)
  }, [loadReport])

  const totals = useMemo(
    () =>
      report.reduce(
        (result, item) => ({
          income: result.income + Number(item.income),
          expense: result.expense + Number(item.expense),
          net: result.net + Number(item.net_cashflow),
        }),
        { income: 0, expense: 0, net: 0 },
      ),
    [report],
  )
  const hasData = totals.income !== 0 || totals.expense !== 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Laporan Owner"
        title="Rekap Keuangan"
        description="Bandingkan pemasukan, pengeluaran, dan arus kas bersih setiap bulan."
        action={
          <label className="relative block min-w-44">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              type="number"
              min="1"
              max="9999"
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              aria-label="Tahun laporan"
              className="bg-white pl-10 font-bold"
            />
          </label>
        }
      />

      {loading ? (
        <LoadingState rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadReport} />
      ) : !hasData ? (
        <EmptyState
          icon={FileBarChart2}
          title={`Belum ada data untuk ${year}`}
          description="Transaksi aktif pada tahun yang dipilih akan otomatis muncul di laporan ini."
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Total Pemasukan" value={totals.income} icon={ArrowUpRight} tone="income" />
            <SummaryCard label="Total Pengeluaran" value={totals.expense} icon={ArrowDownRight} tone="expense" />
            <SummaryCard label="Arus Kas Bersih" value={totals.net} icon={CircleDollarSign} tone="net" />
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-extrabold text-slate-900">Grafik Bulanan</h2>
              <p className="mt-1 text-xs text-slate-400">Pemasukan dan pengeluaran sepanjang {year}</p>
            </div>
            <MonthlyChart data={report} height={260} />
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-extrabold text-slate-900">Rincian per Bulan</h2>
            </div>
            <div className="app-scrollbar overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Bulan</th>
                    <th className="px-6 py-4 text-right">Pemasukan</th>
                    <th className="px-6 py-4 text-right">Pengeluaran</th>
                    <th className="px-6 py-4 text-right">Arus Kas Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.map((item, index) => (
                    <tr key={item.month} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-bold text-slate-700">{monthNames[index]} {year}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatIDR(item.income)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-rose-500">{formatIDR(item.expense)}</td>
                      <td className={classNames('px-6 py-4 text-right font-extrabold', Number(item.net_cashflow) >= 0 ? 'text-brand-700' : 'text-rose-600')}>
                        {formatIDR(item.net_cashflow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
