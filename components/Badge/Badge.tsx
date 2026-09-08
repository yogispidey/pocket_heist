import styles from "./Badge.module.css";

type BadgeVariant = "success" | "failure" | "pending";

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const LABELS: Record<BadgeVariant, string> = {
  success: "SUCCESS",
  failure: "FAILED",
  pending: "PENDING",
};

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {label ?? LABELS[variant]}
    </span>
  );
}
