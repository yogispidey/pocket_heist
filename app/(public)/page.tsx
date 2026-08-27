// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div style={{ color: "var(--color-secondary)", fontWeight: 600 }}>
          The office is a battlefield. Choose your missions.
        </div>
        <p>
          Pocket Heist turns your office into a playground. Assign sneaky
          missions to your colleagues — swap someone's keyboard shortcuts, move
          the stapler to the top shelf, or challenge them to speak only in
          riddles until 3pm. Earn points, climb the leaderboard, and defend your
          desk with honour.
        </p>
        <p>
          Every heist has a time limit. Complete it before it expires, or face
          the eternal shame of the <em>Failed Missions</em> board.
        </p>
      </div>
    </div>
  );
}
