import type { Metadata } from "next"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "BLACK MIRROR",
  description: "BLACK MIRROR",
}

export default function HomePage() {
  return (
    <div className={`${styles.home} black-mirror-home`}>
      <object
        aria-label="BLACK MIRROR"
        className={styles.title}
        data="/black-mirror.svg"
        role="img"
        tabIndex={-1}
        type="image/svg+xml"
      />
    </div>
  )
}
