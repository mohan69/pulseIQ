"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatExecutiveCurrency } from "@/lib/utils";
import type { Cockpit, CockpitMetric } from "@/lib/assessment/types";

export function RevenueMarginChart({ metrics }: { metrics: CockpitMetric[] }) {
  const revenue = metrics.find((m) => m.key === "revenue");
  const margin = metrics.find((m) => m.key === "margin");
  const data = [
    {
      name: "FY25 actual",
      Revenue: revenue ? revenue.value : 0,
      Margin: revenue ? (revenue.value * (margin?.value ?? 0)) / 100 : 0,
    },
    {
      name: "FY26 forecast",
      Revenue: revenue ? revenue.value * 1.12 : 0,
      Margin:
        revenue && margin
          ? (revenue.value * 1.12 * (margin.value + 1)) / 100
          : 0,
    },
    {
      name: "FY26 target",
      Revenue: revenue ? revenue.target : 0,
      Margin: revenue ? (revenue.target * (margin?.target ?? 0)) / 100 : 0,
    },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatExecutiveCurrency(Number(v))}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #d7e4f0",
            fontSize: 12,
          }}
          formatter={(v) => formatExecutiveCurrency(Number(v))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Margin" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WinRateLineChart({ metrics }: { metrics: CockpitMetric[] }) {
  const win = metrics.find((m) => m.key === "winrate");
  const current = win?.value ?? 0;
  const target = win?.target ?? 0;
  const data = [
    { name: "Q1", winRate: current - 4 },
    { name: "Q2", winRate: current - 2 },
    { name: "Q3", winRate: current },
    { name: "Q4 (plan)", winRate: target },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 40]}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #d7e4f0",
            fontSize: 12,
          }}
          formatter={(v) => `${v}%`}
        />
        <Line
          type="monotone"
          dataKey="winRate"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ r: 4, fill: "#2563eb" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WorkingCapitalBars({ metrics }: { metrics: CockpitMetric[] }) {
  const ar = metrics.find((m) => m.key === "receivables")?.value ?? 0;
  const inv = 22_00_00_000;
  const ap = 9_00_00_000;
  const data = [
    { name: "Receivables", value: ar, fill: "#dc2626" },
    { name: "Inventory", value: inv, fill: "#d97706" },
    { name: "Payables", value: ap, fill: "#059669" },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatExecutiveCurrency(Number(v))}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #d7e4f0",
            fontSize: 12,
          }}
          formatter={(v) => formatExecutiveCurrency(Number(v))}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CockpitStatusBoard({ cockpit }: { cockpit: Cockpit }) {
  const off = cockpit.metrics.filter((m) => m.status === "off_track").length;
  const risk = cockpit.metrics.filter((m) => m.status === "at_risk").length;
  const ok = cockpit.metrics.filter((m) => m.status === "on_track").length;
  const data = [
    { name: "On track", value: ok, fill: "#059669" },
    { name: "At risk", value: risk, fill: "#d97706" },
    { name: "Off track", value: off, fill: "#dc2626" },
  ];
  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f8" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #d7e4f0",
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
