// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
        </h1>
        <div>Tiny missions. Big office mischief.</div>
        <p>
          Welcome to Pocket Heist — the game where the office becomes your playground.
          Dream up devious little missions, assign them to your unsuspecting colleagues,
          and watch the chaos unfold. Complete heists before the clock runs out to climb
          the ranks and cement your reputation as the ultimate office mastermind.
        </p>
      </div>
    </div>
  )
}
