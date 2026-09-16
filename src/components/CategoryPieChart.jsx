import { useMemo } from 'react'
import { useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from './ui.jsx'
import { formatCompact, formatIDR } from '../utils/formatters.js'

const chartColors = ['#2563eb', '#fbbf24', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6']
const radius = 76
const circumference = 2 * Math.PI * radius

function categorySummary(transactions) {
  const grouped = transactions.reduce((result, transaction) => {
    const categoryId = transaction.category_id || 'uncategorized'
    const name = transaction.category?.name || (categoryId === 'uncategorized' ? 'Tanpa kategori' : `Kategori #${categoryId}`)
    const current = result.get(categoryId) || { id: categoryId, name, amount: 0 }
    current.amount += Number(transaction.amount) || 0
    result.set(categoryId, current)
    return result
  }, new Map())

  return [...grouped.values()].sort((first, second) => second.amount - first.amount)
}

export default function CategoryPieChart({ transactions = [], loading = false, error = '', onRetry }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const categories = useMemo(() => categorySummary(transactions), [transactions])
  const total = categories.reduce((sum, category) => sum + category.amount, 0)
  const hoveredCategory = hoveredIndex === null ? null : categories[hoveredIndex]

  if (loading && !transactions.length) return <LoadingState rows={3} />
  if (error && !transactions.length) return <ErrorState message={error} onRetry={onRetry} />
  if (!categories.length || total <= 0) {
    return (
      <EmptyState
        title="Belum ada data kategori"
        description="Transaksi aktif dengan kategori akan muncul di grafik ini."
      />
    )
  }

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
      <div className="relative mx-auto h-60 w-60 max-w-full">
        {hoveredCategory && (
          <div className="pointer-events-none absolute top-1 left-1/2 z-10 w-44 -translate-x-1/2 rounded-xl bg-slate-900/95 px-3 py-2.5 text-center text-white shadow-xl">
            <p className="truncate text-xs font-extrabold">{hoveredCategory.name}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-300">
              {formatIDR(hoveredCategory.amount)} · {Math.round((hoveredCategory.amount / total) * 100)}%
            </p>
          </div>
        )}
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label="Diagram distribusi transaksi berdasarkan kategori"
          className="h-full w-full -rotate-90"
        >
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#eef2f7" strokeWidth="28" />
          {categories.map((category, index) => {
            const segment = (category.amount / total) * circumference
            const visibleSegment = Math.max(segment - 3, 0)
            const currentOffset = categories
              .slice(0, index)
              .reduce((sum, previousCategory) => sum + (previousCategory.amount / total) * circumference, 0)
            return (
              <circle
                key={category.id}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={chartColors[index % chartColors.length]}
                strokeWidth="28"
                strokeDasharray={`${visibleSegment} ${circumference}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                tabIndex="0"
                role="button"
                aria-label={`Detail kategori ${category.name}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-slate-400">Total</span>
          <strong className="mt-1 text-lg font-extrabold text-slate-900">{formatCompact(total)}</strong>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category, index) => {
          const percentage = Math.round((category.amount / total) * 100)
          return (
            <div key={category.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-xs">
              <div className="flex min-w-0 items-center gap-2 font-bold text-slate-700">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <span className="truncate">{category.name}</span>
              </div>
              <span className="font-extrabold text-slate-800">{formatIDR(category.amount)}</span>
              <span className="w-9 text-right font-semibold text-slate-400">{percentage}%</span>
              <div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(category.amount / total) * 100}%`,
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
