"use client"

import { SearchDialog } from "@/components/layout/SearchDialog"
import { NavigationMenu } from "@/components/layout/NavigationMenu"

type HeaderNavProps = {
  labels: {
    about: string
    search: string
  }
}

export function HeaderNav({ labels }: HeaderNavProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <SearchDialog />
      </div>
      <NavigationMenu labels={labels} />
    </div>
  )
}
