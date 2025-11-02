// /src/pages/Subscribers/subscriberList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useSubscribersStore } from "../../stores/useSubscribersStore";
import SubscriberCard from "../../components/ui/SubscriberCard";

export default function SubscriberList({ onAdd, onEdit }) {
  const subscribers     = useSubscribersStore((s) => s.subscribers) || [];
  const loading         = useSubscribersStore((s) => s.loading);
  const error           = useSubscribersStore((s) => s.error);

  const fetchSubscribers = useSubscribersStore((s) => s.fetchSubscribers);
  const deleteSubscriber = useSubscribersStore((s) => s.deleteSubscriber);

  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    fetchSubscribers().catch((err) => {
      console.error("fetchSubscribers error", err);
      notify.action("fetch").error("Failed to load subscribers");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (item) => {
    const id = item?.id || item?._id;
    if (!id) return notify.action("delete").error("Missing subscriber id");
    try {
      setDeletingIds((p) => new Set(p).add(id));
      await deleteSubscriber(id);
      notify.action("delete").success("Subscriber deleted");
    } catch (e) {
      console.error(e);
      notify.action("delete").error(e?.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingIds((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    }
  };

  return (
    <PageLayout title="Subscribers | ProfMSE">
      <Toaster position="bottom-right" />

      <PageHeader title="Subscribers" description="Manage newsletter subscribers">
        {onAdd ? (
          <Button onClick={onAdd} variant="primary">+ Add Subscriber</Button>
        ) : (
          <Link to="/subscribers/form">
            <Button variant="primary">+ Add Subscriber</Button>
          </Link>
        )}
      </PageHeader>

      {/* Table list like Session Plans */}
      <main className="w-full px-4 pb-24">
        {error && (
          <div className="text-center text-red-600 mb-4">Failed to load subscribers.</div>
        )}

        {!error && (!subscribers || subscribers.length === 0) ? (
          <div className="text-center text-brand-600">No subscribers yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-25">
                <tr className="text-left border-b border-brand-200">
                  <th className="py-3 px-4 font-semibold text-brand-700">Email</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Name</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Created</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && subscribers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-5 w-24 rounded bg-gray-200" />
                        <div className="h-10 w-full rounded bg-gray-200" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  (subscribers || []).map((s) => {
                    const id = s?.id || s?._id;
                    return (
                      <tr key={id || s.email} className="border-b last:border-b-0 border-brand-200 py-6 hover:bg-gray-50">
                        <td className="py-3 px-4">{s.email || "—"}</td>
                        <td className="py-3 px-4">{s.name || s.fullName || "—"}</td>
                        <td className="py-3 px-4">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            {onEdit && (
                              <Button variant="update" onClick={() => onEdit(s)}>
                                Edit
                              </Button>
                            )}
                            <Button
                              variant="delete"
                              onClick={() => handleDelete(s)}
                              disabled={!id || deletingIds.has(id)}
                            >
                              {deletingIds.has(id) ? "Deleting…" : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
