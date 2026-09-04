import styles from "./HeistCardSkeleton.module.css";

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <div className={`${styles.pulse} ${styles.titleBlock}`} />
        <div className={`${styles.pulse} ${styles.iconBlock}`} />
      </div>
      <div className={styles.meta}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.metaRow}>
            <div className={`${styles.pulse} ${styles.iconBlock}`} />
            <div className={`${styles.pulse} ${styles.labelBlock}`} />
            <div className={`${styles.pulse} ${styles.valueBlock}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
