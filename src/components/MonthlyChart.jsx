import { useState } from 'react'
import { formatCompact, monthNames } from '../utils/formatters.js'
import { classNames } from '../utils/classNames.js'

const chartWidth = 760
const chartHeight = 280
const chartPadding = { top: 10, right: 14, bottom: 38, left: 54 }
const gridLineCount = 4

function createPoints(data, key, maxValue) {
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const denominator = Math.max(data.length - 1, 1)

  return data.map((item, index) => {
    const value = Number(item[key]) || 0
    return {
      value,
      x: chartPadding.left + (index / denominator) * plotWidth,
      y: chartPadding.top + plotHeight - (value / maxValue) * plotHeight,
    }
  })
}

function smoothPath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const previous = points[index - 1]
    const midpoint = (previous.x + point.x) / 2
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`
  }, '')
}

function areaPath(points, baseline) {
  if (points.length === 0) return ''
  return `${smoothPath(points)} L ${points.at(-1).x} ${baseline} L ${points[0].x} ${baseline} Z`
}

export default function MonthlyChart({ data = [], height = 220, fillHeight = false, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const values = data.flatMap((item) => [Number(item.income) || 0, Number(item.expense) || 0])
  const maxValue = Math.max(...values, 1)
  const chartMax = Math.max(10_000_000, Math.ceil(maxValue / 2_500_000) * 2_500_000)
  const plotBottom = chartHeight - chartPadding.bottom
  const incomePoints = createPoints(data, 'income', chartMax)
  const expensePoints = createPoints(data, 'expense', chartMax)
  const hoveredPoint = hoveredIndex === null ? null : incomePoints[hoveredIndex] || expensePoints[hoveredIndex]
  const tooltipWidth = 172
  const tooltipHeight = 68
  const tooltipX = hoveredPoint
    ? Math.min(
        Math.max(hoveredPoint.x - tooltipWidth / 2, chartPadding.left),
        chartWidth - chartPadding.right - tooltipWidth,
      )
    : 0
  const tooltipY = hoveredPoint
    ? hoveredPoint.y < chartPadding.top + tooltipHeight + 16
      ? hoveredPoint.y + 14
      : hoveredPoint.y - tooltipHeight - 14
    : 0

  return (
    <div className={classNames(fillHeight && 'flex h-full min-h-[260px] min-w-0 flex-col', className)}>
      <div className="mb-5 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Pemasukan
        </span>
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-sun-500" /> Pengeluaran
        </span>
      </div>
      <div className={classNames('app-scrollbar overflow-x-auto pb-2', fillHeight && 'min-h-0 flex-1')}>
        <div className={classNames('w-full min-w-[620px]', fillHeight && 'h-full')}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="Grafik pemasukan dan pengeluaran bulanan"
            className={classNames('block w-full', fillHeight && 'h-full')}
            style={fillHeight ? undefined : { height }}
          >
            {Array.from({ length: gridLineCount + 1 }, (_, index) => {
              const value = chartMax - (chartMax / gridLineCount) * index
              const y = chartPadding.top + ((chartMax - value) / chartMax) * (plotBottom - chartPadding.top)
              return (
                <g key={value}>
                  <line
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={y}
                    y2={y}
                    stroke="#e7edf5"
                    strokeWidth="1"
                  />
                  <text
                    x={chartPadding.left - 12}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[11px] font-medium"
                  >
                    {formatCompact(value)}
                  </text>
                </g>
              )
            })}

            <path d={areaPath(incomePoints, plotBottom)} fill="#2563eb" fillOpacity="0.1" />
            <path d={areaPath(expensePoints, plotBottom)} fill="#fbbf24" fillOpacity="0.12" />
            <path d={smoothPath(incomePoints)} fill="none" stroke="#2563eb" strokeLinecap="round" strokeWidth="3" />
            <path d={smoothPath(expensePoints)} fill="none" stroke="#fbbf24" strokeLinecap="round" strokeWidth="3" />

            {data.map((item, index) => {
              const point = incomePoints[index] || expensePoints[index]
              const previousPoint = incomePoints[index - 1] || expensePoints[index - 1]
              const nextPoint = incomePoints[index + 1] || expensePoints[index + 1]
              const startX = previousPoint ? (previousPoint.x + point.x) / 2 : chartPadding.left
              const endX = nextPoint ? (point.x + nextPoint.x) / 2 : chartWidth - chartPadding.right
              return (
                <rect
                  key={`hover-${item.month}`}
                  x={startX}
                  y={chartPadding.top}
                  width={endX - startX}
                  height={plotBottom - chartPadding.top}
                  fill="transparent"
                  tabIndex="0"
                  role="button"
                  aria-label={`Detail grafik ${monthNames[index]}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                />
              )
            })}

            {incomePoints.map((point, index) => (
              <circle
                key={`income-${data[index].month}`}
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="white"
                stroke="#2563eb"
                strokeWidth="2.5"
                pointerEvents="none"
              />
            ))}
            {expensePoints.map((point, index) => (
              <circle
                key={`expense-${data[index].month}`}
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="white"
                stroke="#fbbf24"
                strokeWidth="2.5"
                pointerEvents="none"
              />
            ))}

            {hoveredPoint && hoveredIndex !== null && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  x2={hoveredPoint.x}
                  y1={chartPadding.top}
                  y2={plotBottom}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                />
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="10"
                  fill="#0f172a"
                  fillOpacity="0.96"
                />
                <text x={tooltipX + 14} y={tooltipY + 19} className="fill-white text-[11px] font-extrabold">
                  {monthNames[hoveredIndex]}
                </text>
                <circle cx={tooltipX + 17} cy={tooltipY + 36} r="3" fill="#60a5fa" />
                <text x={tooltipX + 26} y={tooltipY + 40} className="fill-slate-200 text-[10px] font-medium">
                  Masuk {formatCompact(data[hoveredIndex].income)}
                </text>
                <circle cx={tooltipX + 17} cy={tooltipY + 53} r="3" fill="#fbbf24" />
                <text x={tooltipX + 26} y={tooltipY + 57} className="fill-slate-200 text-[10px] font-medium">
                  Keluar {formatCompact(data[hoveredIndex].expense)}
                </text>
              </g>
            )}

            {data.map((item, index) => {
              const point = incomePoints[index] || expensePoints[index]
              return (
                <text
                  key={item.month}
                  x={point?.x ?? chartPadding.left}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px] font-semibold"
                >
                  {monthNames[index]}
                </text>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
