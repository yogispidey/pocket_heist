import Link from "next/link";
import { CircleX, User, Calendar } from "lucide-react";
import { Heist } from "@/types/firestore";
import styles from "./ExpiredHeistCard.module.css";

interface ExpiredHeistCardProps {
  heist: Heist;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  success: { label: "SUCCESS", className: styles.badgeSuccess },
  failure: { label: "FAILED", className: styles.badgeFailed },
};

export default function ExpiredHeistCard({ heist }: ExpiredHeistCardProps) {
  const formattedDeadline = heist.deadline
    ? heist.deadline.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "No deadline";

  const { label: badgeLabel, className: badgeClass } = STATUS_CONFIG[
    heist.finalStatus ?? ""
  ] ?? {
    label: "PENDING",
    className: styles.badgePending,
  };

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.topLeft}>
          <CircleX
            size={16}
            className={styles.expiredIcon}
            aria-hidden="true"
          />
          <Link href={`/heists/${heist.id}`} className={styles.title}>
            {heist.title}
          </Link>
        </div>
        <div className={styles.topRight}>
          <div className={styles.datetime}>
            <Calendar size={12} className={styles.icon} aria-hidden="true" />
            <span>{formattedDeadline}</span>
          </div>
          <span className={`${styles.badge} ${badgeClass}`}>{badgeLabel}</span>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.metaGroup}>
          <User size={12} className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>To:</span>
          <span className={styles.assignee}>{heist.assignedToCodename}</span>
        </div>
        <div className={styles.metaGroup}>
          <User size={12} className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>By:</span>
          <span className={styles.creator}>{heist.createdByCodename}</span>
        </div>
      </div>
    </div>
  );
}
