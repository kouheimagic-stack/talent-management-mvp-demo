"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TeamSignalChartProps = {
  data: {
    name: string;
    readiness: number;
    engagement: number;
    growth: number;
  }[];
};

export function TeamSignalChart({ data }: TeamSignalChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="readiness" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} width={32} />
            <Tooltip />
            <Area
              dataKey="readiness"
              name="面談準備度"
              type="monotone"
              stroke="#0284c7"
              strokeWidth={3}
              fill="url(#readiness)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} width={32} />
            <Tooltip />
            <Bar dataKey="engagement" name="関心・意欲" fill="#0f2f57" radius={[6, 6, 0, 0]} />
            <Bar dataKey="growth" name="成長速度" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
