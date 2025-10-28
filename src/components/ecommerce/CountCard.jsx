// src/components/dashboard/CountCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function CountCard({
  title,
  value = 0,
  trend = null, // { dir: "up" | "down", pct: 10 }
  to = null,   // optional link path
  icon = null, // optional React node
}) {
  const pct = typeof trend?.pct === "number" ? `${Math.abs(trend.pct)}%` : null;
  const trendCls =
    trend?.dir === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend?.dir === "down"
      ? "text-rose-600 bg-rose-50"
      : "text-brand-600 bg-brand-50";

  const content = (
    <div className="relative flex h-full flex-col rounded-2xl border border-brand-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-brand-600">{title}</p>
        {icon ? <div className="opacity-80">{icon}</div> : null}
      </div>

      <div className="mt-2 flex items-end justify-between">
        <h3 className="text-3xl font-extrabold tracking-tight text-brand-800">
          {Intl.NumberFormat("en-US").format(value ?? 0)}
        </h3>

        {pct && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trendCls}`}>
            {trend?.dir === "up" ? "↑" : trend?.dir === "down" ? "↓" : "•"} {pct}
          </span>
        )}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block focus:outline-none focus:ring-2 focus:ring-brand-400 rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
}
