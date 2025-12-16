import React, { useEffect, useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader";
import UniversalCard from "../../components/ui/UniversalCard";
import { useBlogsStore } from "../../stores/useBlogStore";
import { useServicesStore } from "../../stores/useServicesStore";
import { useSubscribersStore } from "../../stores/useSubscribersStore";
import {
  FileText,
  Briefcase,
  Users,
  Mail,
  Phone,
  BadgeCheck,
  User2,
} from "lucide-react";

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <UniversalCard className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {value}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            updated
          </span>
        </div>
      </div>

      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>

    <div className="mt-4 h-px bg-gray-100 dark:bg-gray-700/60" />

    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs text-gray-500 dark:text-gray-400">Overview</span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
        —
      </span>
    </div>
  </UniversalCard>
);

const Avatar = ({ name }) => {
  const initial = (name || "N")[0]?.toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {initial}
      </span>
    </div>
  );
};

export default function Home() {
  const { Blogs, fetchBlogs } = useBlogsStore();
  const { services, fetchServices } = useServicesStore();
  const { subscribers, fetchSubscribers } = useSubscribersStore();

  useEffect(() => {
    fetchBlogs();
    fetchServices();
    fetchSubscribers();
  }, [fetchBlogs, fetchServices, fetchSubscribers]);

  const latestSubscribers = useMemo(
    () => (subscribers || []).slice(0, 5),
    [subscribers]
  );

  return (
    <div title="Dashboard | Prof" className="space-y-6 p-5">
      <PageHeader
        title="ProfMSE Dashboard"
        description="Medical Research & Biostatistics Dashboard - Dr. Mohammed Said ElSharkawy"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FileText}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          label="Total Blogs"
          value={Blogs?.length ?? 0}
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          label="Total Services"
          value={services?.length ?? 0}
        />
        <StatCard
          icon={Users}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
          label="Total Subscribers"
          value={subscribers?.length ?? 0}
        />
      </div>

      {/* Latest Subscribers */}
      <UniversalCard className="p-0">
        {/* Card Header */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Latest Subscribers
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Most recent contacts added to your list
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <BadgeCheck className="w-4 h-4" />
            Synced
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3">Subscriber</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {latestSubscribers.length > 0 ? (
                latestSubscribers.map((subscriber, index) => {
                  const name = subscriber?.name || "N/A";
                  const email = subscriber?.email || "N/A";
                  const phone = subscriber?.phone || "N/A";
                  const status = subscriber?.status || "active";
                  const isActive = status === "active";

                  return (
                    <tr
                      key={subscriber?.id || index}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <User2 className="w-3.5 h-3.5" />
                              Subscriber
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[260px]">
                            {email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{phone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
                          ].join(" ")}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="bg-white dark:bg-gray-800">
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="h-12 w-12 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      </div>
                      <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                        No subscribers yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Once people subscribe, you’ll see them listed here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
          Showing {Math.min(latestSubscribers.length, 5)} of{" "}
          {subscribers?.length ?? 0} subscribers
        </div>
      </UniversalCard>
    </div>
  );
}
