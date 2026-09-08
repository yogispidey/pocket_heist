import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Pocket Heist &mdash; tiny missions, big office mischief.
      </p>
    </footer>
  );
}
