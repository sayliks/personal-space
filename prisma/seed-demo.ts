import { Prisma, PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateSlug } from "../lib/slug";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;

const CATEGORIES = [
  {
    title: "整理",
    legacyTitle: "Tending",
    summary: "关于我想如何使用这个空间的一组笔记。",
  },
  {
    title: "例子",
    legacyTitle: "Examples",
    summary: "几篇真实的小笔记，而不是系统说明。",
  },
];

const TAGS = [
  { name: "入门", legacyName: "getting-started" },
  { name: "工作流", legacyName: "workflow" },
  { name: "标签", legacyName: "linking" },
];

interface NoteDef {
  title: string;
  legacyTitle: string;
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
    title: "从这里开始",
    legacyTitle: "Start here",
    summary: "几条写给自己的提醒，关于我想如何使用这个空间。",
    category: "整理",
    tags: ["入门"],
    publishedDaysAgo: 21,
    content: `我反复回到同一个想法：我写下的大多数东西，都不应该急着变成定稿。笔记更像是给一个念头留下的临时住处，让未来的我可以再把它捡起来。

所以我从这里开始，先给自己留下几条关于这个空间的使用方式：

- [[链接如何工作]] — 为什么我更愿意标签笔记，而不是把它们收进文件夹
- [[会生长的笔记]] — 当我回来修改想法时，会发生什么
- [[路径与标签]] — 我组织内容的两种方式

这些都还不完整，而这正是重点。我宁愿保留一篇会被我反复回访的粗糙笔记，也不想留下一个漂亮却再也不会打开的成品。`,
  },
  {
    title: "链接如何工作",
    legacyTitle: "How linking works",
    summary: "为什么我标签笔记而不是归档它们，以及反向链接如何改变写作方式。",
    category: "整理",
    tags: ["入门", "标签"],
    publishedDaysAgo: 18,
    content: `当一篇笔记里的某个想法让我想起另一篇，我就直接在句子里把它们连起来。链接只是另一篇笔记的标题，用双中括号包住，比如 [[从这里开始]]。

我没想到自己会这么喜欢的一点是：它是双向的。打开一篇笔记，底部会显示所有指向它的地方。我不必记得自己在哪里提过某个想法，标签会自己把路径带回来。

这改变了我的写作方式。我不再过度纠结某个念头“属于”哪篇笔记。我让它落在当下的位置，然后向外链接。时间久了，链接比文件夹更重要。像 [[会生长的笔记]] 这样的笔记，会在没有预先规划的情况下和许多地方连在一起。

反向链接让这里更像是在思考，而不是在整理档案。`,
  },
  {
    title: "会生长的笔记",
    legacyTitle: "Notes that evolve",
    summary: "一篇笔记在被我回头修改之后，才开始变得可信。",
    category: "整理",
    tags: ["工作流"],
    publishedDaysAgo: 14,
    tendedDaysAgo: 2,
    content: `两周前的第一版里，我写过：一篇笔记发布之后就算完成了。

现在我不再相信这句话。回来再看，我真正想要的恰好相反：我最信任的笔记，是那些我回头读过、改过、重新理解过的笔记。一篇一年都没有动过的笔记，也许只是被遗弃了。

所以这篇笔记会有意保留它的时间痕迹。它显示第一次写下的日期，也显示最后一次触碰它的时间，而这两个日期之间的距离本身就是信息。如果我持续回访某个东西，那是一种安静的信号：这个想法对我来说还活着。

这也回到 [[链接如何工作]]：一篇持续被修改的笔记，往往也会慢慢收集更多链接。打磨和标签，其实在朝同一个方向用力。

（这篇就是在写完几天后又改过，所以它被标记为整理过。很合适。）`,
  },
  {
    title: "路径与标签",
    legacyTitle: "Paths and connections",
    summary: "组织笔记的两种方式：它住在哪里，以及它还关于什么。",
    category: "整理",
    tags: ["入门"],
    publishedDaysAgo: 11,
    content: `我一直把两种组织笔记的方式混在一起，直到把它们的区别写下来。

**路径** 是一篇笔记住在哪里。每篇笔记只属于一条路径，它有点像这里最接近文件夹的东西。这篇笔记和 [[从这里开始]] 一样，都放在我用来整理思考方式的路径里。

**标签** 会穿过路径。它是我贴在笔记上的标签，可以把住在完全不同位置、但共享同一条线索的内容连起来。一篇关于我如何工作的笔记可以在一条路径里，另一篇完全不同的笔记也可以带着同一个标签。

我暂时定下的规则是：如果我问“它应该放在哪里”，那是路径；如果我问“它还和什么有关”，那是标签。而 [[链接如何工作]] 是第三种关系：两篇具体笔记之间的直接指向，而不是它们共同归属的某个集合。`,
  },
  {
    title: "值得回访的笔记",
    legacyTitle: "A note worth revisiting",
    summary: "值得回头看的想法，往往是第一次没有被完全解决的想法。",
    category: "例子",
    tags: ["工作流", "标签"],
    publishedDaysAgo: 7,
    tendedDaysAgo: 1,
    content: `这是一个我真的会留在这里的小例子，而不是一篇解释系统如何运作的说明。

我一直在想，为什么有些想法值得回来再看，而另一些不会。现在的猜测是：值得回访的，通常是第一次没有被完全解决的东西。它们会留下一个松开的线头。一篇把所有事情都收束得很漂亮的笔记当然让人满足，但也容易变得静止，因为没有什么还能继续拉动它。

所以现在，当我写完一篇笔记并且觉得“完全结束了”，我会把这种感觉当作一个温和的提醒。也许那意味着我只是写下了自己早就知道的东西。

[[会生长的笔记]] 是我想清楚“回访为什么重要”的地方。而这一篇只是我和一个开放问题坐在一起，并且暂时让它保持开放。

---

*几天后的补记：* 回来看这篇时，我留下的那个线头长成了另一篇笔记：[[标签式思考]]。这正是我一直绕着走的模式：开放的问题会长出新的链接。回访这篇笔记让那个标签浮了上来，这大概就是意义所在。`,
  },
  {
    title: "标签式思考",
    legacyTitle: "Connected thinking",
    summary: "我最看重的笔记，往往站在好几篇笔记交汇的地方。",
    category: "例子",
    tags: ["工作流", "标签"],
    publishedDaysAgo: 4,
    tendedDaysAgo: 1,
    content: `我最看重的笔记，很少是完全自足的。它们往往站在几篇笔记相遇的地方。

我是在观察哪些内容互相链接时注意到这一点的。一个只被提到一次的想法，通常还只是碎片。但当三四篇笔记开始指向同一个东西，它常常会变成某种我其实已经相信、只是还没有命名的东西。

[[值得回访的笔记]] 就是一个例子：它一开始只是一个随手留下的问题，后来慢慢收集了引用，变成一个小主题。而 [[链接如何工作]] 是让这种事情发生的机制，不需要我手动追踪。

我想，这才是标签笔记而不是归档笔记的真正原因。归档假设我已经知道结构是什么；链接则允许结构自己显现。

*第二天早上的补记：* 我重读了 [[从这里开始]]，发现它不像索引，更像一张我想回到哪里的地图。我要保护的其实是这种习惯。`,
  },
];

async function upsertDocumentByTitle(args: {
  title: string;
  legacyTitle: string;
  data: Prisma.DocumentUncheckedCreateInput;
}) {
  const slug = generateSlug(args.title);
  const legacySlug = generateSlug(args.legacyTitle);
  const existing = await prisma.document.findFirst({
    where: { OR: [{ slug }, { slug: legacySlug }] },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return prisma.document.update({
      where: { id: existing.id },
      data: { ...args.data, slug },
    });
  }

  return prisma.document.create({ data: args.data });
}

async function upsertTagByName(name: string, legacyName: string) {
  const slug = generateSlug(name);
  const legacySlug = generateSlug(legacyName);
  const existing = await prisma.tag.findFirst({
    where: { OR: [{ slug }, { slug: legacySlug }] },
  });

  if (existing) {
    return prisma.tag.update({
      where: { id: existing.id },
      data: { name, slug },
    });
  }

  return prisma.tag.create({ data: { name, slug } });
}

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
    const row = await upsertDocumentByTitle({
      title: c.title,
      legacyTitle: c.legacyTitle,
      data: {
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
  for (const tag of TAGS) {
    const row = await upsertTagByName(tag.name, tag.legacyName);
    tagIdByName.set(tag.name, row.id);
  }

  // Notes — upsert by slug, rewire tags, then pin timestamps.
  const now = Date.now();
  for (const n of NOTES) {
    const slug = generateSlug(n.title);
    const categoryId = categoryIdBySlug.get(generateSlug(n.category)) ?? null;

    const note = await upsertDocumentByTitle({
      title: n.title,
      legacyTitle: n.legacyTitle,
      data: {
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
