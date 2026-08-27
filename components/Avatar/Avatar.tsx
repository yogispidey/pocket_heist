import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export default function Avatar({ name }: AvatarProps) {
  return (
    <div
      className={styles.avatar}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
