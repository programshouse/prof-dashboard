// src/components/dashboard/CountsGrid.jsx
import React from "react";
import CountCard from "./CountCard";
import {
  BookOpen,
  Rows3,
  Users as UsersIcon,
  Video,
} from "lucide-react";

const iconCls = "h-5 w-5 text-brand-500";

// أرقام افتراضية (عدّلها براحتك)
const DEFAULT_ITEMS = [
  { key: "workshops", title: "Workshops", to: "/workshops", icon: <Video className={iconCls} />, value: 24,  trend: { dir: "up",   pct: 8 } },
  { key: "books",     title: "Books",     to: "/books",     icon: <BookOpen className={iconCls} />, value: 13,  trend: { dir: "up",   pct: 3 } },
  { key: "sessions",  title: "Sessions",  to: "/sessions",  icon: <Rows3 className={iconCls} />, value: 47,  trend: { dir: "down", pct: 2 } },
  { key: "users",     title: "Users",     to: "/users",     icon: <UsersIcon className={iconCls} />, value: 3782, trend: { dir: "up",   pct: 11 } },
];

// لو عايز تمرر قيمك الجاهزة: <CountsGrid items={[...]}/>
export default function CountsGrid({ items }) {
  const data = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {data.map((r) => (
        <div key={r.key} className="col-span-12 sm:col-span-6 xl:col-span-3">
          {/* غلاف بسيط لتحسين الـhover والـfocus */}
          <div className="rounded-2xl ring-1 ring-brand-200/60 hover:ring-brand-300 transition">
            <CountCard
              title={r.title}
              value={r.value ?? 0}
              to={r.to}
              icon={r.icon}
              trend={r.trend}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
