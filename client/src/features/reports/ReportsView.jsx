import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../shared/api/client';
import { useToast } from '../../shared/context/ToastContext';
import ReportCard from './ReportCard';
import GlucoseTrendChart from './GlucoseTrendChart';
import { SLOT_CONFIG } from '../readings/ReadingsList';
import { Calendar, CalendarDays, BarChart2, History, Clock, Sparkles } from 'lucide-react';

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
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [reportData, setReportData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('mtd'); // 'mtd' | 'monthly'
  const [trendReadings, setTrendReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState('');

  const fetchReportsAndChart = useCallback(async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/reports?date=${selectedDate}`);
      setReportData(data);

      // Determine date range for chart based on chartPeriod toggle
      const range = chartPeriod === 'mtd' ? data.mtd : data.monthly;
      if (range?.startDate && range?.endDate) {
        const readingsRes = await apiRequest(
          `/readings?startDate=${range.startDate}&endDate=${range.endDate}`
        );
        setTrendReadings(readingsRes.readings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate reports.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, chartPeriod]);

  useEffect(() => {
    fetchReportsAndChart();
  }, [fetchReportsAndChart]);

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await apiRequest('/readings/seed-demo', { method: 'POST' });
      showToast(res.message || 'Seeded 45 days of sample glucose data!', 'success');
      await fetchReportsAndChart();
    } catch (err) {
      showToast(err.message || 'Failed to seed sample data.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const currentPeriodLabel = chartPeriod === 'mtd'
    ? reportData?.mtd ? formatRangeDisplay(reportData.mtd.startDate, reportData.mtd.endDate) : 'This Month'
    : reportData?.monthly ? formatRangeDisplay(reportData.monthly.startDate, reportData.monthly.endDate) : 'Previous Month';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Selector Header & Quick Demo Seeder */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Clinical Reports</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare daily performance against Month-to-Date and Previous Month metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Quick Demo Data Seeder Button */}
          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 border border-pink-200 dark:border-pink-900/50 transition disabled:opacity-50"
            title="Populate demo data covering both current and previous months"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>{isSeeding ? 'Seeding...' : '⚡ Seed Demo Data (45 Days)'}</span>
          </button>

          {/* Anchor Date Picker */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:inline">
              Anchor:
            </label>
            <div className="relative flex-1 sm:flex-initial">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mb-3"></div>
          <p>Calculating glucose aggregations...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-6 rounded-2xl text-rose-700 dark:text-rose-300 text-sm text-center">
          {error}
        </div>
      ) : reportData ? (
        <div className="space-y-4 sm:space-y-6">
          {/* 3 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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

          {/* Interactive Trend Chart with Month Switcher */}
          <GlucoseTrendChart
            readings={trendReadings}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            periodLabel={currentPeriodLabel}
          />

          {/* Daily Slot Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Daily Slot Readings ({formatDisplayDate(reportData.daily.date)})
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Breakdown of recorded slots for this date</p>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-1 sm:mt-0">
                {reportData.daily.count} of 4 slots recorded
              </span>
            </div>

            {reportData.daily.readings && reportData.daily.readings.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {reportData.daily.readings.map((reading) => {
                  const slotConfig = SLOT_CONFIG[reading.slot] || {
                    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    icon: null
                  };

                  return (
                    <div
                      key={reading.id}
                      className="px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${slotConfig.bg}`}>
                          {slotConfig.icon}
                          <span>{reading.slot}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{reading.value}</span>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">mg/dl</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No slot readings recorded for this day</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Use the Readings tab to add readings for this date.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
