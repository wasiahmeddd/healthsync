import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const DynamicMetricChart = ({ recordType, entries }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!entries || entries.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          No recorded entries yet. Add your first measurement below to see interactive trend graphs.
        </p>
      </div>
    );
  }

  // Find numeric fields to plot
  const numericFields = recordType.fields.filter(f => f.type === 'number');

  if (numericFields.length === 0) {
    return (
      <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500">
        This category contains textual/document records without numeric charting.
      </div>
    );
  }

  // Format data chronological for chart (oldest to newest)
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => {
      const point = {
        date: entry.date,
        displayDate: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      numericFields.forEach(field => {
        if (entry.values[field.key] !== undefined && entry.values[field.key] !== "") {
          point[field.key] = Number(entry.values[field.key]);
        }
      });
      return point;
    });

  const colors = [
    recordType.color || '#0d9488',
    '#3b82f6',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6'
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">
            {recordType.name} Trend Analysis
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historical measurements over time ({chartData.length} records)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {numericFields.map((field, idx) => (
            <span
              key={field.key}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
              style={{
                backgroundColor: `${colors[idx % colors.length]}18`,
                color: colors[idx % colors.length]
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              {field.label} ({field.unit || 'val'})
            </span>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#334155' : '#e2e8f0'}
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              stroke={isDark ? '#94a3b8' : '#64748b'}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke={isDark ? '#94a3b8' : '#64748b'}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
            {numericFields.map((field, idx) => (
              <Line
                key={field.key}
                type="monotone"
                dataKey={field.key}
                name={field.label}
                stroke={colors[idx % colors.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: colors[idx % colors.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
