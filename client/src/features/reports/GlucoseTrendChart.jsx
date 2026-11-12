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
import { TrendingUp } from 'lucide-react';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 sm:p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
        <div className="font-semibold text-pink-300 mb-1">{data.date}</div>
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

export default function GlucoseTrendChart({ readings = [] }) {
  if (!readings || readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center text-slate-400">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-medium text-slate-600">No chart data for this period</p>
        <p className="text-xs text-slate-400 mt-0.5">Record readings to view blood sugar trajectory over time.</p>
      </div>
    );
  }

  const chartData = [...readings].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4 sm:mb-6 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Glucose Trend Chart</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Target zone: 70–140 mg/dl</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-pink-500"></span>
            <span>Recorded</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 sm:w-3 h-0.5 bg-emerald-500"></span>
            <span>Target</span>
          </span>
        </div>
      </div>

      <div className="h-56 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              tickFormatter={(d) => {
                const parts = d.split('-');
                return `${parts[1]}/${parts[2]}`;
              }}
            />
            <YAxis
              stroke="#94a3b8"
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
              dot={{ r: 3, fill: '#ec4899', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#be185d' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
