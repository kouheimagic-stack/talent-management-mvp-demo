"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PerformanceChartProps = {
  data: {
    period: string;
    score: number;
    rating: string;
  }[];
};

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} />
          <YAxis
            domain={[0, 5]}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(value, _name, item) => [`${value} / ${item.payload.rating}`, "評価"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#0284c7"
            strokeWidth={3}
            fill="url(#scoreGradient)"
            dot={{ r: 4, fill: "#0f2f57", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
