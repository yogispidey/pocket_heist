import styles from "./ExpiredHeistCardSkeleton.module.css";

export default function ExpiredHeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.topLeft}>
          <div className={`${styles.pulse} ${styles.iconBlock}`} />
          <div className={`${styles.pulse} ${styles.titleBlock}`} />
        </div>
        <div className={styles.topRight}>
          <div className={`${styles.pulse} ${styles.datetimeBlock}`} />
          <div className={`${styles.pulse} ${styles.badgeBlock}`} />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.metaGroup}>
          <div className={`${styles.pulse} ${styles.iconBlock}`} />
          <div className={`${styles.pulse} ${styles.labelBlock}`} />
          <div className={`${styles.pulse} ${styles.valueBlock}`} />
        </div>
        <div className={styles.metaGroup}>
          <div className={`${styles.pulse} ${styles.iconBlock}`} />
          <div className={`${styles.pulse} ${styles.labelBlock}`} />
          <div className={`${styles.pulse} ${styles.valueBlock}`} />
        </div>
      </div>
    </div>
  );
}
