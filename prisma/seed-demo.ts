import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateSlug } from "../lib/slug";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;

// Two paths (categories) the demo notes live on.
const CATEGORIES = [
  { title: "Tending", summary: "Notes about how I want to work in this space." },
  { title: "Examples", summary: "A few real notes, not explanations of the system." },
];

// Three connections (tags). `workflow` and `linking` deliberately span both
// paths; `linking` gathers the notes about how ideas connect, which is the one
// thread a first-time reader is most likely to want to follow.
const TAGS = ["getting-started", "workflow", "linking"];

interface NoteDef {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedDaysAgo: number;
  // When set, updatedAt = now - tendedDaysAgo (a meaningful gap -> "tended").
  // When omitted, updatedAt is pinned to publishedAt so the note reads as settled.
  tendedDaysAgo?: number;
  content: string;
}

const NOTES: NoteDef[] = [
  {
    title: "Start here",
    summary: "A few notes I've left myself about how I want to use this space.",
    category: "Tending",
    tags: ["getting-started"],
    publishedDaysAgo: 21,
    content: `I keep coming back to one idea: most of what I write should not be finished. A note is somewhere to leave a thought so the next version of me can pick it up again.

So this is where I'm starting — a few notes to myself about how I want to use this place:

- [[How linking works]] — why I connect notes instead of filing them away
- [[Notes that evolve]] — what happens when I come back and change my mind
- [[Paths and connections]] — the two ways I group things

None of these are complete, and that's the point. I'd rather keep a rough note I actually revisit than a polished one I never open again.`,
  },
  {
    title: "How linking works",
    summary: "Why I connect notes instead of filing them, and why backlinks change how I write.",
    category: "Tending",
    tags: ["getting-started", "linking"],
    publishedDaysAgo: 18,
    content: `When something in one note reminds me of another, I link them right there in the sentence. The link is just the other note's title in double brackets, like [[Start here]].

The part I didn't expect to like so much: it works both ways. Open a note and it shows everything pointing back to it at the bottom. I don't have to remember where I mentioned an idea — the connections find their way back to me.

That changed how I write. I stopped worrying about which note a thought "belongs" in. I write it wherever it lands and link outward. Over time the links matter more than any folder would. A note like [[Notes that evolve]] ends up tied to several others without my planning it.

Backlinks are the reason this feels like thinking, not filing.`,
  },
  {
    title: "Notes that evolve",
    summary: "A note is most trustworthy once I've come back and changed it.",
    category: "Tending",
    tags: ["workflow"],
    publishedDaysAgo: 14,
    tendedDaysAgo: 2,
    content: `First draft, two weeks ago, I wrote that a note is done once I publish it.

I don't believe that anymore. Coming back now, what I actually want is the opposite: the notes I trust most are the ones I've returned to and changed. A note that hasn't moved in a year might just be abandoned.

So this note wears its age on purpose. It shows when it was first written and when I last touched it, and the gap between those dates is information. If I keep revisiting something, that's a quiet signal the idea is still alive for me.

This ties back to [[How linking works]] — a note I keep editing tends to gather links too. Refinement and connection pull in the same direction.

(I edited this one a few days after writing it, which is why it's marked as tended. Fitting.)`,
  },
  {
    title: "Paths and connections",
    summary: "Two ways to group notes — where a note lives versus what it's about.",
    category: "Tending",
    tags: ["getting-started"],
    publishedDaysAgo: 11,
    content: `Two different ways to group notes, and I kept mixing them up until I wrote down the difference.

A **path** is where a note lives. Each note sits on one — it's the closest thing here to a folder. This note lives on the same path I use for working out how I want to think, alongside [[Start here]].

A **connection** cuts across paths. It's a label I can put on notes that live in completely different places but share a thread. One note about how I work might sit on one path while a note somewhere else carries the same connection.

The rule I settled on: if I'm asking "where does this belong?", that's a path. If I'm asking "what else is this about?", that's a connection. And [[How linking works]] is a third kind of relation — a direct link between two specific notes, rather than a group either of them sits in.`,
  },
  {
    title: "A note worth revisiting",
    summary: "The ideas worth returning to are the ones I couldn't fully resolve.",
    category: "Examples",
    tags: ["workflow", "linking"],
    publishedDaysAgo: 7,
    tendedDaysAgo: 1,
    content: `A small example of the kind of note I actually keep here — not one explaining the system.

I've been wondering why some ideas feel worth coming back to and others don't. My current guess: the ones worth revisiting are the ones I couldn't fully resolve the first time. They leave a loose end. A note that wrapped everything up neatly is satisfying but inert; there's nothing left to pull on.

So now, when I finish a note and feel completely done with it, I treat that as a mild warning. It might mean I only wrote down what I already knew.

[[Notes that evolve]] is where I worked out why revisiting matters at all. This one is just me sitting with an open question and leaving it open.

---

*Edit, a few days later:* coming back to this, the loose end I left turned into its own note — [[Connected thinking]]. That's the pattern I was circling: the open questions are the ones that grow new links. Revisiting this note is what surfaced the connection, which feels like the point.`,
  },
  {
    title: "Connected thinking",
    summary: "The notes I value most sit at the intersection of several others.",
    category: "Examples",
    tags: ["workflow", "linking"],
    publishedDaysAgo: 4,
    tendedDaysAgo: 1,
    content: `The notes I value most are rarely self-contained. They're the ones sitting where a few others meet.

I noticed this looking at what links to what. A thought I only ever reference once stays a fragment. But when three or four notes start pointing at the same idea, it usually turns out to be something I actually believe — I just hadn't named it yet.

[[A note worth revisiting]] is a good example: it began as an offhand question and slowly gathered references until it became a small theme. And [[How linking works]] is the mechanism that lets that happen without my tracking it by hand.

I think that's the real reason to connect notes instead of filing them. Filing assumes I already know the structure. Linking lets the structure show up on its own.

*Edit, the next morning:* I re-read [[Start here]] and realized it's less an index than a map of where I want to return. That's the habit I'm trying to protect.`,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("ADMIN_EMAIL must be set in .env (run `npm run seed` first).");
    process.exit(1);
  }

  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    console.error(`No user found for ${email}. Run \`npm run seed\` first.`);
    process.exit(1);
  }

  // Paths (categories) — upsert by slug, never delete.
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const slug = generateSlug(c.title);
    const row = await prisma.document.upsert({
      where: { slug },
      update: { title: c.title, summary: c.summary, type: "CATEGORY" },
      create: {
        title: c.title,
        slug,
        summary: c.summary,
        type: "CATEGORY",
        authorId: admin.id,
      },
    });
    categoryIdBySlug.set(slug, row.id);
  }

  // Connections (tags) — upsert by slug.
  const tagIdByName = new Map<string, string>();
  for (const name of TAGS) {
    const slug = generateSlug(name);
    const row = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    tagIdByName.set(name, row.id);
  }

  // Notes — upsert by slug, rewire tags, then pin timestamps.
  const now = Date.now();
  for (const n of NOTES) {
    const slug = generateSlug(n.title);
    const categoryId = categoryIdBySlug.get(generateSlug(n.category)) ?? null;

    const note = await prisma.document.upsert({
      where: { slug },
      update: {
        title: n.title,
        summary: n.summary,
        content: n.content,
        published: true,
        type: "POST",
        categoryId,
      },
      create: {
        title: n.title,
        slug,
        summary: n.summary,
        content: n.content,
        published: true,
        type: "POST",
        authorId: admin.id,
        categoryId,
      },
    });

    // Rewire only this demo note's tags (scoped, non-destructive to other notes).
    await prisma.documentTag.deleteMany({ where: { documentId: note.id } });
    for (const tagName of n.tags) {
      const tagId = tagIdByName.get(tagName);
      if (tagId) {
        await prisma.documentTag.create({
          data: { documentId: note.id, tagId },
        });
      }
    }

    // Pin publishedAt and updatedAt deterministically. updatedAt is @updatedAt
    // (auto-now on write), so it must be set last via raw SQL — otherwise every
    // back-dated note would look "tended". Non-tended notes get updatedAt =
    // publishedAt; the one tended note gets a deliberate gap.
    const publishedAt = new Date(now - n.publishedDaysAgo * DAY);
    const updatedAt =
      n.tendedDaysAgo != null
        ? new Date(now - n.tendedDaysAgo * DAY)
        : publishedAt;
    await prisma.$executeRaw`UPDATE "Document" SET "publishedAt" = ${publishedAt}, "updatedAt" = ${updatedAt} WHERE "slug" = ${slug}`;
  }

  console.log(
    `Demo content seeded: ${CATEGORIES.length} paths, ${TAGS.length} connections, ${NOTES.length} notes.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
