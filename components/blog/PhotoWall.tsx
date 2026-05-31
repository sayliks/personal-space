"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import type { Photo, Tag } from "@/app/generated/prisma/client"

interface PhotoWallProps {
  photos: Array<Photo & { tags: Array<{ tag: Tag }> }>
}

export function PhotoWall({ photos }: PhotoWallProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null)

  if (photos.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-lg overflow-hidden border border-border/20 hover:opacity-90 transition-opacity group"
          >
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-xs font-medium line-clamp-2">
                {photo.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full mb-4">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="text-white space-y-2">
              <h3 className="text-xl font-medium">{selectedPhoto.title}</h3>
              {selectedPhoto.description && (
                <p className="text-sm text-white/80">{selectedPhoto.description}</p>
              )}
              {selectedPhoto.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPhoto.tags.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-white/10 rounded text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
