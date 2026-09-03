import { Clock8 } from "lucide-react";
import Link from "next/link";

const SAMPLE_MISSIONS = [
  {
    title: "Keyboard Saboteur",
    description:
      "Swap all the vowel keys on a colleague's keyboard. Sit back and watch the confusion unfold.",
    expires: "47h 23m",
  },
  {
    title: "The Great Stapler Heist",
    description:
      "Relocate the office stapler somewhere unreasonably inconvenient. Top shelf minimum.",
    expires: "23h 11m",
  },
  {
    title: "Riddle Me This",
    description:
      "Your target must speak only in riddles from now until 3pm. No exceptions.",
    expires: "6h 44m",
  },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-logo">
            P
            <Clock8 className="logo" size={14} strokeWidth={2.75} />
            cket Heist
          </p>

          <h1 className="hero-headline">
            Turn your office
            <br />
            into a playground.
          </h1>

          <p className="hero-body">
            Assign sneaky missions to your colleagues — swap their keyboard
            shortcuts, hide the stapler, challenge them to speak only in
            riddles. Every heist has a deadline. Complete it, or face the{" "}
            <em>Failed Missions</em> board.
          </p>

          <div className="hero-actions">
            <Link href="/signup" className="cta-primary">
              Create account
            </Link>
            <Link href="/login" className="cta-secondary">
              Already a member?{" "}
              <span style={{ color: "var(--color-primary)" }}>Log in</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="missions-section">
        <div className="missions-inner">
          <p className="missions-label">Example missions</p>
          <ul className="missions-list">
            {SAMPLE_MISSIONS.map((mission) => (
              <li key={mission.title} className="mission-row">
                <div className="mission-text">
                  <span className="mission-title">{mission.title}</span>
                  <span className="mission-desc">{mission.description}</span>
                </div>
                <div className="mission-timer">
                  <span className="timer-label">expires in</span>
                  <span className="timer-value">{mission.expires}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <style>{`
        .hero {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 2rem;
        }

        .hero-inner {
          max-width: 48rem;
          margin: 0 auto;
          width: 100%;
        }

        .hero-logo {
          color: var(--color-body);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 3rem;
          letter-spacing: -0.01em;
        }

        .hero-headline {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.08;
          color: white;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
        }

        .hero-body {
          font-size: 1.0625rem;
          color: var(--color-body);
          max-width: 38rem;
          line-height: 1.75;
          margin-bottom: 2.5rem;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1.75rem;
          flex-wrap: wrap;
        }

        .cta-primary {
          display: inline-block;
          padding: 0.75rem 2rem;
          border-radius: 10px;
          background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
          color: white;
          font-weight: 600;
          font-size: 0.9375rem;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .cta-primary:hover {
          opacity: 0.85;
        }

        .cta-secondary {
          color: var(--color-body);
          font-size: 0.875rem;
          text-decoration: none;
        }

        .missions-section {
          padding: 4rem 2rem 6rem;
          border-top: 1px solid var(--color-lighter);
        }

        .missions-inner {
          max-width: 48rem;
          margin: 0 auto;
        }

        .missions-label {
          color: var(--color-body);
          font-size: 0.8125rem;
          margin-bottom: 1.5rem;
        }

        .missions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
          background-color: var(--color-lighter);
        }

        .mission-row {
          background: var(--color-light);
          padding: 1.25rem 1.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: center;
        }

        .mission-text {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .mission-title {
          color: white;
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .mission-desc {
          color: var(--color-body);
          font-size: 0.875rem;
          line-height: 1.55;
        }

        .mission-timer {
          text-align: right;
          flex-shrink: 0;
        }

        .timer-label {
          display: block;
          color: var(--color-body);
          font-size: 0.6875rem;
          margin-bottom: 0.15rem;
        }

        .timer-value {
          display: block;
          color: var(--color-secondary);
          font-weight: 600;
          font-size: 0.9375rem;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 540px) {
          .mission-row {
            grid-template-columns: 1fr;
          }
          .mission-timer {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
