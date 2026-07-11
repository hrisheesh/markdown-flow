"use client";

import React, { useId, useMemo } from "react";
import JSON5 from "json5";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartConfig = {
  type: "bar" | "line" | "pie" | "area" | "radar" | "composed";
  title?: string;
  data: Record<string, string | number>[];
  keys?: string[];
  colors?: string[];
  lines?: string[];
  bars?: string[];
  areas?: string[];
};

type TooltipPayloadEntry = { color?: string; name?: string; value?: string | number };

const DEFAULT_COLORS = ["#007AFF", "#34C759", "#AF52DE", "#FF9F0A", "#FF375F"];
const chartHeight = 304;

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string | number }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-2xl border border-black/[0.08] bg-white/95 px-3.5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <p className="mb-2.5 text-xs font-semibold tracking-[-0.01em] text-[#1d1d1f]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2 text-xs text-[#6e6e73]">
            <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums text-[#1d1d1f]">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RichChart({ configStr }: { configStr: string }) {
  const chartId = useId().replace(/:/g, "");
  const config = useMemo<ChartConfig | null>(() => {
    try {
      return JSON5.parse(configStr.replace(/^`+|`+$/g, "").trim());
    } catch {
      return null;
    }
  }, [configStr]);

  if (!config?.data || !config.type) {
    return <div className="my-8 border-y border-black/[0.08] bg-[#fbfbfd] px-5 py-4 text-sm text-[#6e6e73]">This chart configuration is incomplete.</div>;
  }

  const { type, title, data, keys = ["value"], colors = DEFAULT_COLORS, lines = [], bars = [], areas = [] } = config;
  const series = type === "pie" ? data.map((item) => String(item.name ?? "value")) : type === "composed" ? [...bars, ...lines, ...areas] : keys;
  const axisProps = { tick: { fontSize: 11, fill: "#86868b", fontWeight: 500 }, axisLine: false, tickLine: false, tickMargin: 10 };
  const grid = <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#e5e5ea" />;
  const chartMargin = { top: 18, right: 12, left: -18, bottom: 2 };
  const gradientId = (key: string) => `chart-${chartId}-${key.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const renderChart = () => {
    if (type === "bar") return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={chartMargin}>
          <defs>{keys.map((key, index) => <linearGradient key={key} id={gradientId(key)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity="0.94" /><stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity="0.62" /></linearGradient>)}</defs>
          {grid}<XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} /><Tooltip cursor={{ fill: "rgba(0,122,255,0.045)" }} content={<CustomTooltip />} />
          {keys.map((key) => <Bar key={key} dataKey={key} fill={`url(#${gradientId(key)})`} radius={[6, 6, 2, 2]} maxBarSize={38} isAnimationActive />)}
        </BarChart>
      </ResponsiveContainer>
    );
    if (type === "line") return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data} margin={chartMargin}>
          {grid}<XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} /><Tooltip cursor={{ stroke: "#d1d1d6", strokeWidth: 1 }} content={<CustomTooltip />} />
          {keys.map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2.75} dot={false} activeDot={{ r: 4.5, strokeWidth: 3, stroke: "#fff", fill: colors[index % colors.length] }} isAnimationActive />)}
        </LineChart>
      </ResponsiveContainer>
    );
    if (type === "area") return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={chartMargin}>
          <defs>{keys.map((key, index) => <linearGradient key={key} id={gradientId(key)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity="0.3" /><stop offset="78%" stopColor={colors[index % colors.length]} stopOpacity="0.06" /><stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity="0" /></linearGradient>)}</defs>
          {grid}<XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} /><Tooltip cursor={{ stroke: "#d1d1d6", strokeWidth: 1 }} content={<CustomTooltip />} />
          {keys.map((key, index) => <Area key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} fill={`url(#${gradientId(key)})`} strokeWidth={2.75} activeDot={{ r: 4.5 }} isAnimationActive />)}
        </AreaChart>
      </ResponsiveContainer>
    );
    if (type === "radar") return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#e5e5ea" /><PolarAngleAxis dataKey="name" tick={{ fill: "#86868b", fontSize: 11, fontWeight: 500 }} /><PolarRadiusAxis tick={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {keys.map((key, index) => <Radar key={key} name={key} dataKey={key} stroke={colors[index % colors.length]} fill={colors[index % colors.length]} fillOpacity={0.16} strokeWidth={2.4} isAnimationActive />)}
        </RadarChart>
      </ResponsiveContainer>
    );
    if (type === "composed") return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={data} margin={{ top: 22, right: 2, left: -18, bottom: 2 }} barCategoryGap="38%">
          <defs>{bars.map((key, index) => <linearGradient key={key} id={gradientId(key)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity="0.9" /><stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity="0.48" /></linearGradient>)}</defs>
          {grid}<XAxis dataKey="name" {...axisProps} /><YAxis yAxisId="bars" {...axisProps} width={42} /><YAxis yAxisId="lines" orientation="right" tick={{ fontSize: 11, fill: "#86868b", fontWeight: 500 }} axisLine={false} tickLine={false} tickMargin={9} width={42} />
          <Tooltip cursor={{ fill: "rgba(0,122,255,0.04)" }} content={<CustomTooltip />} />
          {areas.map((key, index) => <Area key={key} yAxisId="lines" type="monotone" dataKey={key} fill={colors[(bars.length + lines.length + index) % colors.length]} fillOpacity={0.09} stroke="none" isAnimationActive />)}
          {bars.map((key) => <Bar key={key} yAxisId="bars" dataKey={key} fill={`url(#${gradientId(key)})`} radius={[7, 7, 3, 3]} maxBarSize={32} isAnimationActive />)}
          {lines.map((key, index) => <Line key={key} yAxisId="lines" type="monotone" dataKey={key} stroke={colors[(bars.length + index) % colors.length]} strokeWidth={3} dot={{ r: 2.5, fill: "#fff", strokeWidth: 2, stroke: colors[(bars.length + index) % colors.length] }} activeDot={{ r: 5, fill: colors[(bars.length + index) % colors.length], stroke: "#fff", strokeWidth: 3 }} isAnimationActive />)}
        </ComposedChart>
      </ResponsiveContainer>
    );
    const pieKey = keys[0];
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart><Tooltip content={<CustomTooltip />} /><Pie data={data} dataKey={pieKey} nameKey="name" cx="50%" cy="50%" outerRadius={102} innerRadius={74} paddingAngle={2} stroke="#fbfbfd" strokeWidth={3} isAnimationActive>{data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie></PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <section className="my-10 w-full min-w-0 border-y border-black/[0.08] bg-[#fbfbfd] py-5 sm:py-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-1 sm:px-2">
        <div><h3 className="text-[17px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">{title || "Untitled chart"}</h3><p className="mt-1 text-xs text-[#86868b]">{data.length} observations · {type} chart</p></div>
        {series.length > 0 && <div className="flex max-w-full flex-wrap gap-x-4 gap-y-2" aria-label="Chart legend">{series.map((name, index) => <span key={`${name}-${index}`} className="flex items-center gap-1.5 text-xs text-[#6e6e73]"><span className="size-1.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{name}</span>)}</div>}
      </div>
      <div className="mt-4 h-[17rem] px-1 sm:mt-5 sm:h-[19rem] sm:px-2">{renderChart()}</div>
    </section>
  );
}
