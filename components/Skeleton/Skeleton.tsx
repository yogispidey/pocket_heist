import styles from "./Skeleton.module.css"

export default function Skeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar} />
        <div className={styles.headerLines}>
          <div className={`${styles.line} ${styles.w80}`} />
          <div className={`${styles.line} ${styles.w50}`} />
        </div>
      </div>
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.w100}`} />
        <div className={`${styles.line} ${styles.w100}`} />
        <div className={`${styles.line} ${styles.w70}`} />
      </div>
    </div>
  )
}
