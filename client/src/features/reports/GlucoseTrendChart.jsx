import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '../../shared/context/ThemeContext';
import { formatDDMMYYYY } from '../../shared/utils/date';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white p-2.5 sm:p-3 rounded-xl shadow-xl border border-slate-800 dark:border-slate-700 text-xs backdrop-blur-md">
        <div className="font-semibold text-pink-300 dark:text-pink-400 mb-1">{formatDDMMYYYY(data.date)}</div>
        <div className="text-slate-300">
          Slot: <span className="font-medium text-white">{data.slot}</span>
        </div>
        <div className="text-slate-300 mt-0.5">
          Level:{' '}
          <span className="font-bold text-white text-sm">{data.value} mg/dl</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function GlucoseTrendChart({
  readings = [],
  period = 'mtd',
  onPeriodChange,
  periodLabel = ''
}) {
  const { isDark } = useTheme();
  const chartData = [...readings].sort((a, b) => new Date(a.date) - new Date(b.date));

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors duration-200">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0 border border-pink-100 dark:border-pink-900/50">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Glucose Trend Chart</span>
              {periodLabel && (
                <span className="text-[11px] font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-100 dark:border-pink-900/50">
                  {periodLabel}
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Blood sugar trajectory across time</p>
          </div>
        </div>

        {/* This Month vs Previous Month Toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {onPeriodChange && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => onPeriodChange('mtd')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  period === 'mtd'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                This Month (MTD)
              </button>
              <button
                type="button"
                onClick={() => onPeriodChange('monthly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  period === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Previous Month
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span>Level</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500"></span>
              <span>Target (70–140)</span>
            </span>
          </div>
        </div>
      </div>

      {readings.length === 0 ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No readings found for {period === 'mtd' ? 'this month' : 'the previous month'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Use the "⚡ Seed Demo Data" button above to populate sample readings!</p>
        </div>
      ) : (
        <div className="h-56 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                tickFormatter={(d) => {
                  if (!d) return '';
                  const parts = d.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}`; // DD/MM format
                  }
                  return d;
                }}
              />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                domain={[40, 'auto']}
                unit=" mg"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" label={{ value: '70', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={140} stroke="#10b981" strokeDasharray="4 4" label={{ value: '140', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '180', fill: '#f59e0b', fontSize: 10, position: 'right' }} />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ec4899', strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#fff' }}
                activeDot={{ r: 5, fill: '#be185d' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
