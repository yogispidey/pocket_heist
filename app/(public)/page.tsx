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
        <ol>
          <li>Sign up or log in to get started.</li>
          <li>Browse active heists on your dashboard.</li>
          <li>Create a new heist and assign it to a colleague.</li>
          <li>Complete assigned heists before they expire to earn points.</li>
          <li>Check the leaderboard to see who the top agent is.</li>
        </ol>
      </div>
    </div>
  )
}
