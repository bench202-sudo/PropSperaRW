import React, { useMemo } from 'react';

interface EmailVolumeChartProps {
  notifications: Array<{
    email_status: string;
    created_at: string;
  }>;
  days?: number;
}

const EmailVolumeChart: React.FC<EmailVolumeChartProps> = ({ notifications, days = 14 }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const data: Array<{ date: string; label: string; sent: number; failed: number; pending: number; total: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayNotifs = notifications.filter(n => {
        const nDate = new Date(n.created_at).toISOString().split('T')[0];
        return nDate === dateStr;
      });

      data.push({
        date: dateStr,
        label,
        sent: dayNotifs.filter(n => n.email_status === 'sent' || n.email_status === 'delivered').length,
        failed: dayNotifs.filter(n => n.email_status === 'failed' || n.email_status === 'bounced').length,
        pending: dayNotifs.filter(n => n.email_status === 'pending').length,
        total: dayNotifs.length,
      });
    }

    return data;
  }, [notifications, days]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.total), 1);
    return Math.ceil(max / 5) * 5 || 5;
  }, [chartData]);

  const chartWidth = 700;
  const chartHeight = 220;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const paddingTop = 10;
  const paddingRight = 10;
  const barGroupWidth = (chartWidth - paddingLeft - paddingRight) / chartData.length;
  const barWidth = Math.min(barGroupWidth * 0.65, 32);
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const yTicks = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-gray-500">Sent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-xs text-gray-500">Failed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <span className="text-xs text-gray-500">Pending</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full min-w-[500px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + usableHeight - (tick / maxValue) * usableHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? '0' : '4,4'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px]"
                  fill="#9ca3af"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, i) => {
            const x = paddingLeft + i * barGroupWidth + (barGroupWidth - barWidth) / 2;
            const sentH = (d.sent / maxValue) * usableHeight;
            const failedH = (d.failed / maxValue) * usableHeight;
            const pendingH = (d.pending / maxValue) * usableHeight;
            const baseY = paddingTop + usableHeight;

            return (
              <g key={d.date}>
                {/* Sent bar (bottom) */}
                {d.sent > 0 && (
                  <rect
                    x={x}
                    y={baseY - sentH}
                    width={barWidth}
                    height={sentH}
                    rx="3"
                    fill="#10b981"
                    className="transition-all duration-300"
                  >
                    <title>{`${d.label}: ${d.sent} sent`}</title>
                  </rect>
                )}
                {/* Failed bar (stacked) */}
                {d.failed > 0 && (
                  <rect
                    x={x}
                    y={baseY - sentH - failedH}
                    width={barWidth}
                    height={failedH}
                    rx="3"
                    fill="#ef4444"
                    className="transition-all duration-300"
                  >
                    <title>{`${d.label}: ${d.failed} failed`}</title>
                  </rect>
                )}
                {/* Pending bar (stacked) */}
                {d.pending > 0 && (
                  <rect
                    x={x}
                    y={baseY - sentH - failedH - pendingH}
                    width={barWidth}
                    height={pendingH}
                    rx="3"
                    fill="#fbbf24"
                    className="transition-all duration-300"
                  >
                    <title>{`${d.label}: ${d.pending} pending`}</title>
                  </rect>
                )}
                {/* Zero state - small gray bar */}
                {d.total === 0 && (
                  <rect
                    x={x}
                    y={baseY - 2}
                    width={barWidth}
                    height={2}
                    rx="1"
                    fill="#d1d5db"
                  />
                )}
                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="text-[9px]"
                  fill="#9ca3af"
                  transform={`rotate(-30, ${x + barWidth / 2}, ${chartHeight - 8})`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + usableHeight}
            stroke="#d1d5db"
            strokeWidth="1"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + usableHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + usableHeight}
            stroke="#d1d5db"
            strokeWidth="1"
          />
        </svg>
      </div>
      {notifications.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No email data available for the selected period
        </div>
      )}
    </div>
  );
};

export default EmailVolumeChart;
