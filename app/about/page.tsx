import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about")
  return {
    title: t("title"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("about")

  const projects = [
    {
      name: "lumison",
      url: "https://github.com/frostsalix/lumison",
      desc: t("projects.lumison"),
    },
    {
      name: "e-commerce-api",
      url: "https://github.com/frostsalix/e-commerce-api",
      desc: t("projects.ecommerceApi"),
    },
    {
      name: "MiNotes",
      url: "https://github.com/frostsalix/MiNotes",
      desc: t("projects.minotes"),
    },
  ]

  const skills = [
    "HTML", "CSS", "JavaScript", "TypeScript", "Python", "Java", "C", "C++",
    "React", "Next.js", "Tailwind CSS", "Node.js", "FastAPI", "Spring Boot",
    "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis",
    "Docker", "Nginx", "Linux", "Git", "GitHub Actions",
    "Cloudflare", "Vercel", "Kubernetes",
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <p className="text-muted-foreground leading-relaxed mb-8">
        {t("bio")}
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">{t("location")}</h2>
        <p className="text-muted-foreground">{t("locationValue")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">{t("projects.title")}</h2>
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.name}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {p.name}
              </a>
              <span className="text-muted-foreground"> — {p.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">{t("skills")}</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">{t("links.title")}</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            GitHub:{" "}
            <a
              href="https://github.com/frostsalix"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              github.com/frostsalix
            </a>
          </li>
          <li>
            {t("links.blog")}:{" "}
            <a
              href="https://matsumae.top"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              matsumae.top
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
