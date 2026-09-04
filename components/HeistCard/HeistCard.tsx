import Link from "next/link";
import { Clock, User, Calendar } from "lucide-react";
import { Heist } from "@/types/firestore";
import styles from "./HeistCard.module.css";

interface HeistCardProps {
  heist: Heist;
}

export default function HeistCard({ heist }: HeistCardProps) {
  const isOverdue = heist.deadline < new Date();
  const formattedDeadline = heist.deadline.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <Clock
          size={16}
          className={isOverdue ? styles.clockOverdue : styles.clock}
        />
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <User size={12} />
          <span className={styles.label}>To:</span>
          <span className={styles.assignee}>{heist.assignedToCodename}</span>
        </div>
        <div className={styles.metaRow}>
          <User size={12} />
          <span className={styles.label}>By:</span>
          <span className={styles.creator}>{heist.createdByCodename}</span>
        </div>
        <div className={styles.metaRow}>
          <Calendar size={12} />
          <span className={styles.date}>
            {formattedDeadline}
            {isOverdue && <span className={styles.overdue}> • Overdue</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
