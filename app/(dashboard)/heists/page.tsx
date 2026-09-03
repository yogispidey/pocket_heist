"use client";

import { useHeists } from "@/hooks/useHeists";

export default function HeistsPage() {
  const { heists: activeHeists } = useHeists("active");
  const { heists: assignedHeists } = useHeists("assigned");
  const { heists: expiredHeists } = useHeists("expired");

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        <ul>
          {activeHeists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        <ul>
          {assignedHeists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
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
