"use client";

import { useHeists } from "@/hooks/useHeists";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";

export default function HeistsPage() {
  const { heists: activeHeists, isLoading: activeLoading } =
    useHeists("active");
  const { heists: assignedHeists, isLoading: assignedLoading } =
    useHeists("assigned");
  const { heists: expiredHeists } = useHeists("expired");

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {activeLoading
            ? [0, 1, 2].map((i) => <HeistCardSkeleton key={i} />)
            : activeHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
        </div>
      </div>

      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {assignedLoading
            ? [0, 1, 2].map((i) => <HeistCardSkeleton key={i} />)
            : assignedHeists.map((h) => <HeistCard key={h.id} heist={h} />)}
        </div>
      </div>

      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        <ul>
          {expiredHeists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
