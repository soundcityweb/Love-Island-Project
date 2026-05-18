/**
 * Single source of truth for merch product image URLs (admin + public shop).
 *
 * Handles:
 * - In-memory blob previews (admin upload UI)
 * - Same-origin proxy: `/uploads/...` → `/api/uploads/...` (Next rewrites to API)
 * - Absolute API URLs with `/uploads/` path → same proxy (works when admin runs on a different port than API)
 * - Full `https://res.cloudinary.com/...` → returned as-is
 * - Bare Cloudinary `public_id` → full delivery URL when `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
 * - Fallback: `/api/uploads/{key}` when cloud name is missing (legacy local keys)
 */
export function resolveProductImageUrl(
  storageKey: string | null | undefined,
): string {
  if (!storageKey) return "/placeholder.svg"
  if (storageKey.startsWith("blob:")) return storageKey
  if (storageKey.startsWith("/api/uploads/")) return storageKey

  if (storageKey.startsWith("/uploads/") || storageKey.startsWith("uploads/")) {
    const key = storageKey.startsWith("/") ? storageKey.slice(1) : storageKey
    return `/api/uploads/${key}`
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    try {
      const { pathname } = new URL(storageKey)
      if (pathname.startsWith("/uploads/")) {
        return `/api${pathname}`
      }
    } catch {
      /* ignore */
    }
    return storageKey
  }

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || ""
  if (cloud) {
    return `https://res.cloudinary.com/${cloud}/image/upload/${storageKey}`
  }

  return `/api/uploads/${storageKey}`
}
