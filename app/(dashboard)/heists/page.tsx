"use client";

import { Clock, Target, Archive } from "lucide-react";
import { useHeists } from "@/hooks/useHeists";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import ExpiredHeistCard from "@/components/ExpiredHeistCard";
import ExpiredHeistCardSkeleton from "@/components/ExpiredHeistCardSkeleton";

const SKELETON_KEYS = [0, 1, 2];

export default function HeistsPage() {
  const { heists: activeHeists, isLoading: activeLoading } =
    useHeists("active");
  const { heists: assignedHeists, isLoading: assignedLoading } =
    useHeists("assigned");
  const { heists: expiredHeists, isLoading: expiredLoading } =
    useHeists("expired");

  return (
    <div className="page-content flex flex-col gap-12 py-8">
      <section aria-labelledby="active-heading">
        <h2
          id="active-heading"
          className="flex items-center gap-2 text-base font-medium text-heading mb-4"
        >
          <Clock size={16} className="text-primary" />
          Active Heists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeLoading
            ? SKELETON_KEYS.map((i) => <HeistCardSkeleton key={i} />)
            : activeHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
        </div>
      </section>

      <section aria-labelledby="assigned-heading">
        <h2
          id="assigned-heading"
          className="flex items-center gap-2 text-base font-medium text-heading mb-4"
        >
          <Target size={16} className="text-secondary" />
          Assigned Heists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedLoading
            ? SKELETON_KEYS.map((i) => <HeistCardSkeleton key={i} />)
            : assignedHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
        </div>
      </section>

      <section aria-labelledby="history-heading">
        <h2
          id="history-heading"
          className="flex items-center gap-2 text-base font-medium text-heading mb-4"
        >
          <Archive size={16} className="text-body" />
          Heist History
        </h2>
        <div role="status" aria-live="polite" aria-label="Heist history">
          {expiredLoading ? (
            <ul
              className="flex flex-col gap-3"
              aria-label="Loading heist history"
            >
              {SKELETON_KEYS.map((i) => (
                <li key={i} style={{ listStyle: "none" }}>
                  <ExpiredHeistCardSkeleton />
                </li>
              ))}
            </ul>
          ) : (
            <ul
              className="flex flex-col gap-3"
              style={{ listStyle: "none", padding: 0 }}
            >
              {expiredHeists.map((h) => (
                <li key={h.id}>
                  <ExpiredHeistCard heist={h} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
