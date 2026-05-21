import { prisma } from "@/lib/prisma"
import { getAllTags } from "@/lib/queries"
import { revalidatePath } from "next/cache"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { generateSlug } from "@/lib/slug"

async function createTag(formData: FormData) {
  "use server"
  const name = formData.get("name") as string
  if (!name) return
  const slug = generateSlug(name)
  await prisma.tag.create({ data: { name, slug } })
  revalidatePath("/admin/tags")
}

async function deleteTag(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await prisma.tag.delete({ where: { id } })
  revalidatePath("/admin/tags")
}

export default async function AdminTagsPage() {
  const tags = await getAllTags()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tags</h1>

      <form action={createTag} className="flex gap-2 mb-6">
        <Input name="name" placeholder="Tag name" required className="max-w-xs" />
        <Button type="submit">Add</Button>
      </form>

      <div className="border rounded-md max-w-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Posts</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm">{t.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{t._count.posts}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteTag}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button variant="destructive" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
