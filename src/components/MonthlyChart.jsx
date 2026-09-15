import { formatCompact, monthNames } from '../utils/formatters.js'

export default function MonthlyChart({ data = [], height = 220 }) {
  const values = data.flatMap((item) => [Number(item.income) || 0, Number(item.expense) || 0])
  const maxValue = Math.max(...values, 1)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Pemasukan
        </span>
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-sun-500" /> Pengeluaran
        </span>
      </div>
      <div className="app-scrollbar overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          <div
            className="relative flex items-end justify-around gap-3 border-b border-slate-200 bg-[linear-gradient(to_bottom,transparent_24%,#f1f5f9_25%,transparent_26%,transparent_49%,#f1f5f9_50%,transparent_51%,transparent_74%,#f1f5f9_75%,transparent_76%)] px-3"
            style={{ height }}
          >
            {data.map((item, index) => {
              const incomeHeight = (Number(item.income) / maxValue) * (height - 22)
              const expenseHeight = (Number(item.expense) / maxValue) * (height - 22)
              return (
                <div key={item.month} className="flex h-full flex-1 items-end justify-center gap-1.5">
                  <div
                    className="group relative w-3.5 rounded-t-md bg-brand-600 transition hover:bg-brand-700"
                    style={{ height: item.income ? Math.max(incomeHeight, 3) : 0 }}
                    title={`Pemasukan ${monthNames[index]}: ${formatCompact(item.income)}`}
                  />
                  <div
                    className="group relative w-3.5 rounded-t-md bg-sun-500 transition hover:bg-amber-600"
                    style={{ height: item.expense ? Math.max(expenseHeight, 3) : 0 }}
                    title={`Pengeluaran ${monthNames[index]}: ${formatCompact(item.expense)}`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-around px-3 pt-3">
            {data.map((item, index) => (
              <span key={item.month} className="flex-1 text-center text-[10px] font-semibold text-slate-400">
                {monthNames[index]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
