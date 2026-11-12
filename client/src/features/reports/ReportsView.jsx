import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../shared/api/client';
import ReportCard from './ReportCard';
import GlucoseTrendChart from './GlucoseTrendChart';
import { Calendar, BarChart2, CalendarDays, History, Clock } from 'lucide-react';

const SLOT_BADGES = {
  'Morning (fasting)': 'bg-amber-50 text-amber-700 border-amber-200',
  'After breakfast': 'bg-orange-50 text-orange-700 border-orange-200',
  'After lunch': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'After dinner': 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatRangeDisplay(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const [sY, sM, sD] = startDate.split('-');
  const [eY, eM, eD] = endDate.split('-');
  const sObj = new Date(sY, sM - 1, sD);
  const eObj = new Date(eY, eM - 1, eD);

  const startStr = sObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const endStr = eObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export default function ReportsView() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [reportData, setReportData] = useState(null);
  const [trendReadings, setTrendReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiRequest(`/reports?date=${selectedDate}`);
        setReportData(data);

        if (data.mtd?.startDate && data.mtd?.endDate) {
          const readingsRes = await apiRequest(
            `/readings?startDate=${data.mtd.startDate}&endDate=${data.mtd.endDate}`
          );
          setTrendReadings(readingsRes.readings || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to generate reports.');
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedDate) {
      fetchReports();
    }
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare daily performance against Month-to-Date and Previous Month metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Anchor Date:
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-slate-800"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mb-3"></div>
          <p>Calculating glucose aggregations...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-700 text-sm text-center">
          {error}
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportCard
              title="Daily Report"
              subtitle={formatDisplayDate(reportData.daily.date)}
              stats={reportData.daily}
              icon={CalendarDays}
              colorTheme="pink"
            />

            <ReportCard
              title="Month-to-Date"
              subtitle={formatRangeDisplay(reportData.mtd.startDate, reportData.mtd.endDate)}
              stats={reportData.mtd}
              icon={BarChart2}
              colorTheme="blue"
            />

            <ReportCard
              title="Monthly (Previous Month)"
              subtitle={formatRangeDisplay(reportData.monthly.startDate, reportData.monthly.endDate)}
              stats={reportData.monthly}
              icon={History}
              colorTheme="emerald"
            />
          </div>

          <GlucoseTrendChart readings={trendReadings} />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daily Slot Readings ({formatDisplayDate(reportData.daily.date)})
                </h3>
                <p className="text-xs text-slate-500">Breakdown of recorded slots for the selected day</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {reportData.daily.count} of 4 slots recorded
              </span>
            </div>

            {reportData.daily.readings && reportData.daily.readings.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {reportData.daily.readings.map((reading) => {
                  const badgeClass = SLOT_BADGES[reading.slot] || 'bg-slate-100 text-slate-700';

                  return (
                    <div
                      key={reading.id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${badgeClass}`}>
                          {reading.slot}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">{reading.value}</span>
                        <span className="text-xs font-medium text-slate-400">mg/dl</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No slot readings recorded for this day</p>
                <p className="text-xs text-slate-400 mt-0.5">Use the Readings tab to add readings for this date.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
