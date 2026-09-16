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
  const values = data.flatMap((item) => [Number(item.income) || 0, Number(item.expense) || 0])
  const maxValue = Math.max(...values, 1)
  const chartMax = Math.max(10_000_000, Math.ceil(maxValue / 2_500_000) * 2_500_000)
  const plotBottom = chartHeight - chartPadding.bottom
  const incomePoints = createPoints(data, 'income', chartMax)
  const expensePoints = createPoints(data, 'expense', chartMax)

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

            {incomePoints.map((point, index) => (
              <circle
                key={`income-${data[index].month}`}
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="white"
                stroke="#2563eb"
                strokeWidth="2.5"
              >
                <title>{`Pemasukan ${monthNames[index]}: ${formatCompact(point.value)}`}</title>
              </circle>
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
              >
                <title>{`Pengeluaran ${monthNames[index]}: ${formatCompact(point.value)}`}</title>
              </circle>
            ))}

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
