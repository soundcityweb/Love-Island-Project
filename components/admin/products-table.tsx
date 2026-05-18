"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Image from "next/image"
import { resolveProductImageUrl } from "@/lib/resolve-product-image-url"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

// ----- Types ----- //

export type ProductStatus = "Active" | "Inactive"
export interface MerchProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  /** Display name of the assigned category (empty string if none). */
  category: string
  /** UUID of the assigned category row (null if unassigned). */
  categoryId: string | null
  image: string
  /** All product images (resolved full URLs). */
  images: string[]
  status: ProductStatus
  stock: number
  lowStockThreshold: number
  /** Units sold. Currently 0 until the backend exposes an order aggregate. */
  sold: number
}

// ----- Helpers ----- //

function formatPrice(n: number) {
  return `NGN ${n.toLocaleString("en-NG")}`
}

function formatStock(n: number, threshold: number) {
  if (n === 0) return "Out of stock"
  if (n <= threshold) return `${n} (Low)`
  return n.toString()
}

function stockClass(n: number, threshold: number) {
  if (n === 0) return "text-red-600"
  if (n <= threshold) return "text-amber-600"
  return "text-card-foreground"
}

function categoryBadgeClass(_cat: string) {
  return "border-primary/20 bg-primary/5 text-primary"
}

// ----- Icons ----- //

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function EmptyBoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

// ----- Stats ----- //

function ProductStats({
  total,
  active,
  inactive,
  revenue,
}: {
  total: number
  active: number
  inactive: number
  revenue: string
}) {
  const cards = [
    { label: "Total Products", value: total.toString(), accent: "bg-foreground/5 text-foreground" },
    { label: "Active", value: active.toString(), accent: "bg-emerald-50 text-emerald-700" },
    { label: "Inactive", value: inactive.toString(), accent: "bg-muted text-muted-foreground" },
    { label: "Est. Revenue", value: revenue, accent: "bg-primary/5 text-primary" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-card-foreground">{card.value}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${card.accent}`}>
              {card.label.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ----- Upload Icon ----- //

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21ZM16.5 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  )
}

// ----- Raw API response shape for a created/updated product ----- //

interface AdminProductImageApi { id: string; url: string; sortOrder: number }
interface AdminProductApi {
  id: string; name: string; slug: string; description: string | null
  basePrice: string; currency: string
  categoryId: string | null
  category: { id: string; name: string } | null
  stock: number; lowStockThreshold: number; isActive: boolean; images: AdminProductImageApi[]
}

function mapApiToMerchProduct(p: AdminProductApi): MerchProduct {
  const sorted = (p.images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)
  const resolvedImages = sorted.map((img) => resolveProductImageUrl(img.url))
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: parseFloat(p.basePrice) || 0,
    category: p.category?.name ?? "",
    categoryId: p.categoryId ?? null,
    image: resolvedImages[0] ?? "/placeholder.svg",
    images: resolvedImages,
    status: p.isActive ? "Active" : "Inactive",
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    sold: 0,
  }
}

// ----- Form types ----- //

interface CreateFields {
  name: string
  categoryId: string
  price: string
  stock: string
  description: string
}

type FormErrors = Partial<Record<keyof CreateFields, string>>

const EMPTY_FIELDS: CreateFields = { name: "", categoryId: "", price: "", stock: "", description: "" }

function validateCreate(fields: CreateFields): FormErrors {
  const errors: FormErrors = {}
  if (!fields.name.trim()) errors.name = "Product name is required."
  if (!fields.categoryId) errors.categoryId = "Category is required."
  const price = parseFloat(fields.price)
  if (!fields.price.trim() || isNaN(price) || price <= 0)
    errors.price = "Enter a valid price greater than 0."
  if (fields.stock.trim()) {
    const stock = parseInt(fields.stock, 10)
    if (isNaN(stock) || stock < 0) errors.stock = "Stock cannot be negative."
  }
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p role="alert" className="mt-1 text-xs font-medium text-destructive">{message}</p>
}

// ----- Product Form Dialog (Create & Edit) ----- //

function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onCreated,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: MerchProduct | null
  onCreated?: (product: MerchProduct) => void
  onUpdated?: (product: MerchProduct) => void
}) {
  const router = useRouter()
  const isEdit = !!product

  // Controlled form fields
  const [fields, setFields] = useState<CreateFields>(EMPTY_FIELDS)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Categories fetched from the DB
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  // Image state
  const [images, setImages] = useState<{ url: string; name: string }[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Reset / pre-fill whenever the dialog opens or the target product changes
  useEffect(() => {
    if (open) {
      setFields(
        product
          ? {
              name: product.name,
              categoryId: product.categoryId ?? "",
              price: product.price.toString(),
              stock: product.stock.toString(),
              description: product.description ?? "",
            }
          : EMPTY_FIELDS,
      )

      // Fetch categories from the DB each time the dialog opens
      setCategoriesLoading(true)
      fetch("/api/admin/categories")
        .then((r) => r.json())
        .then((data: { id: string; name: string; isActive: boolean }[]) => {
          if (Array.isArray(data)) setCategories(data.filter((c) => c.isActive))
        })
        .catch(() => {/* silently fall back to empty list */})
        .finally(() => setCategoriesLoading(false))
      // Pre-fill all images with raw paths so the API receives clean URLs on save
      const existingImages = (product?.images ?? [])
        .filter((url) => url && url !== "/placeholder.svg")
        .map((url, i) => {
          // Convert proxy path back to raw /uploads/... for storage
          const raw = url.startsWith("/api/uploads/") ? url.slice("/api".length) : url
          return { url: raw, name: `image-${i + 1}` }
        })
      setImages(existingImages)
      setErrors({})
      setSubmitError(null)
    }
  }, [open, product])

  const handleClose = useCallback(
    (val: boolean) => {
      if (!val && submitting) return // prevent closing mid-request
      onOpenChange(val)
    },
    [submitting, onOpenChange],
  )

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof CreateFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleFileSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const validFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"))
    if (!validFiles.length) return

    setUploadingImages(true)
    setUploadError(null)

    const formData = new FormData()
    validFiles.forEach((f) => formData.append("images", f))

    try {
      const res = await fetch("/api/admin/products/images", {
        method: "POST",
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError((data as { message?: string }).message || "Upload failed. Please try again.")
        return
      }
      const urls = (data as { urls?: string[] }).urls ?? []
      const newImages = urls.map((url, i) => ({
        // Store the raw server path so the API receives a clean relative path
        url,
        name: validFiles[i]?.name ?? `image-${i + 1}`,
      }))
      setImages((prev) => [...prev, ...newImages])
    } catch {
      setUploadError("Network error during upload. Please try again.")
    } finally {
      setUploadingImages(false)
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)

      // Shared validation for both create and edit
      const fieldErrors = validateCreate(fields)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        const firstKey = Object.keys(fieldErrors)[0]
        document.getElementById(`product-${firstKey}`)?.focus()
        return
      }

      setSubmitting(true)
      try {
        // All images are now real uploaded URLs (blobs are uploaded before reaching here)
        const apiImages = images
          .filter((img) => !img.url.startsWith("blob:"))
          .map((img, i) => ({ url: img.url, sortOrder: i }))

        const body = {
          name: fields.name.trim(),
          categoryId: fields.categoryId || null,
          basePrice: parseFloat(fields.price),
          stock: fields.stock.trim() ? parseInt(fields.stock, 10) : 0,
          description: fields.description.trim() || null,
          images: isEdit || apiImages.length > 0 ? apiImages : undefined,
        }

        const res = await fetch(
          isEdit
            ? `/api/admin/products/${product!.id}`
            : "/api/admin/products",
          {
            method: isEdit ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        )

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          const message =
            typeof (data as { message?: unknown }).message === "string"
              ? (data as { message: string }).message
              : Array.isArray((data as { message?: unknown[] }).message)
                ? (data as { message: string[] }).message.join(", ")
                : isEdit
                  ? "Failed to update product. Please try again."
                  : "Failed to create product. Please try again."
          setSubmitError(message)
          return
        }

        const saved = mapApiToMerchProduct(data as AdminProductApi)
        if (isEdit) {
          onUpdated?.(saved)
        } else {
          onCreated?.(saved)
        }
        handleClose(false)
        router.refresh()
      } catch {
        setSubmitError("Network error. Please check your connection and try again.")
      } finally {
        setSubmitting(false)
      }
    },
    [isEdit, product, fields, images, onCreated, onUpdated, handleClose, router],
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update details for ${product.name}.`
              : "Add a new item to the Love Island Nigeria merch store."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-h-[70vh] space-y-5 overflow-y-auto pr-1"
        >
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="product-name">
              Product Name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="product-name"
              name="name"
              placeholder="e.g. Villa Tee - Coral"
              value={fields.name}
              onChange={handleFieldChange}
              aria-invalid={!!errors.name}
              disabled={submitting}
            />
            <FieldError message={errors.name} />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-category">
                Category <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <select
                id="product-category"
                name="categoryId"
                value={fields.categoryId}
                onChange={handleFieldChange}
                disabled={submitting || categoriesLoading}
                aria-invalid={!!errors.categoryId}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="" disabled>
                  {categoriesLoading ? "Loading…" : "Select category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.categoryId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">
                Price (NGN) <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="product-price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="15000"
                value={fields.price}
                onChange={handleFieldChange}
                aria-invalid={!!errors.price}
                disabled={submitting}
              />
              <FieldError message={errors.price} />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="product-stock">{isEdit ? "Stock" : "Initial Stock"}</Label>
            <Input
              id="product-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="100"
              value={fields.stock}
              onChange={handleFieldChange}
              aria-invalid={!!errors.stock}
              disabled={submitting}
            />
            <FieldError message={errors.stock} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="product-desc">Description</Label>
            <Textarea
              id="product-desc"
              name="description"
              placeholder="Short product description..."
              className="min-h-[80px] resize-none"
              value={fields.description}
              onChange={handleFieldChange}
              disabled={submitting}
            />
          </div>

          {/* Product Images */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <p className="text-xs text-muted-foreground">
              Images are uploaded immediately when selected. The first image is used as the main thumbnail.
            </p>

            {/* Upload error */}
            {uploadError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {uploadError}
              </p>
            )}

            {/* Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border border-border bg-muted">
                    <img src={resolveProductImageUrl(img.url)} alt={img.name} className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      disabled={submitting || uploadingImages}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-red-600 disabled:opacity-30"
                      aria-label={`Remove ${img.name}`}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-card/90 px-1.5 py-0.5 text-[10px] font-bold text-card-foreground backdrop-blur-sm">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                uploadingImages
                  ? "cursor-not-allowed border-primary/40 bg-primary/5"
                  : dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/40 hover:border-primary/40 hover:bg-muted/60"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {uploadingImages ? (
                  <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                ) : images.length === 0 ? (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <UploadIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {uploadingImages ? "Uploading…" : images.length === 0 ? "Upload product images" : "Add more images"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Drag & drop or click to browse. PNG, JPG up to 5MB.
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                disabled={submitting || uploadingImages}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
          </div>

          <Separator />

          {/* Submit error */}
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              disabled={submitting}
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5" disabled={submitting || uploadingImages}>
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : uploadingImages ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                  Uploading images…
                </>
              ) : isEdit ? (
                <>
                  <PencilIcon className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ----- Delete Confirm Dialog ----- //

function DeleteConfirmDialog({
  product,
  onClose,
  onDeleted,
}: {
  product: MerchProduct | null
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!product) {
      setError(null)
      setDeleting(false)
    }
  }, [product])

  const handleDelete = useCallback(async () => {
    if (!product || deleting) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.message || "Failed to delete product. Please try again.")
        return
      }
      onDeleted(product.id)
      router.refresh()
      onClose()
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setDeleting(false)
    }
  }, [product, deleting, onDeleted, onClose, router])

  return (
    <Dialog open={!!product} onOpenChange={(val) => { if (!val && !deleting) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-card-foreground">{product?.name}</span>?{" "}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- Main Component ----- //

export function ProductsTable({ initialProducts }: { initialProducts: MerchProduct[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  // Auto-open create dialog when navigated here with ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreate(true)
      router.replace("/admin/products")
    }
  }, [searchParams, router])
  const [editProduct, setEditProduct] = useState<MerchProduct | null>(null)
  /** IDs of products whose toggle is currently being processed. */
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  /** IDs of products whose last toggle call failed (shows error indicator). */
  const [toggleErrorIds, setToggleErrorIds] = useState<Set<string>>(new Set())
  /** Product awaiting delete confirmation. */
  const [deleteCandidate, setDeleteCandidate] = useState<MerchProduct | null>(null)
  /** IDs of products currently being duplicated. */
  const [duplicatingIds, setDuplicatingIds] = useState<Set<string>>(new Set())
  /** Transient error banner shown after a failed duplicate. */
  const [tableError, setTableError] = useState<string | null>(null)

  const stats = useMemo(() => {
    const active = products.filter((p) => p.status === "Active").length
    const inactive = products.filter((p) => p.status === "Inactive").length
    const totalRevenue = products.reduce((sum, p) => sum + p.price * p.sold, 0)
    const revenueStr =
      totalRevenue >= 1_000_000
        ? `NGN ${(totalRevenue / 1_000_000).toFixed(1)}M`
        : `NGN ${(totalRevenue / 1000).toFixed(0)}k`
    return { total: products.length, active, inactive, revenue: revenueStr }
  }, [products])

  const filtered = useMemo(() => {
    let list = products
    if (activeTab === "active") list = list.filter((p) => p.status === "Active")
    if (activeTab === "inactive") list = list.filter((p) => p.status === "Inactive")
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    }
    return list
  }, [products, activeTab, search])

  const toggleStatus = useCallback(async (id: string) => {
    if (togglingIds.has(id)) return

    // Optimistic flip
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p,
      ),
    )
    setTogglingIds((prev) => new Set(prev).add(id))
    setToggleErrorIds((prev) => { const s = new Set(prev); s.delete(id); return s })

    try {
      const res = await fetch(`/api/admin/products/${id}/toggle-active`, {
        method: "PATCH",
      })

      if (!res.ok) {
        // Roll back the optimistic flip
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p,
          ),
        )
        setToggleErrorIds((prev) => new Set(prev).add(id))
        return
      }

      // Sync the row with the authoritative server value
      const data = await res.json().catch(() => null)
      if (data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? mapApiToMerchProduct(data as AdminProductApi) : p)),
        )
      }

      router.refresh()
    } catch {
      // Network error — roll back
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p,
        ),
      )
      setToggleErrorIds((prev) => new Set(prev).add(id))
    } finally {
      setTogglingIds((prev) => { const s = new Set(prev); s.delete(id); return s })
    }
  }, [togglingIds, router])

  function viewInStore(product: MerchProduct) {
    window.open(`/shop/${product.slug}`, "_blank", "noopener,noreferrer")
  }

  const duplicateProduct = useCallback(async (product: MerchProduct) => {
    if (duplicatingIds.has(product.id)) return
    setDuplicatingIds((prev) => new Set(prev).add(product.id))
    setTableError(null)
    try {
      const payload = {
        name: `Copy of ${product.name}`,
        categoryId: product.categoryId ?? null,
        basePrice: product.price,
        stock: product.stock,
        isActive: false,
        images:
          product.image &&
          !product.image.startsWith("blob:") &&
          product.image !== "/placeholder.svg"
            ? [{ url: product.image, sortOrder: 0 }]
            : [],
      }
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setTableError(data?.message || "Failed to duplicate product.")
        return
      }
      const data = await res.json()
      setProducts((prev) => [mapApiToMerchProduct(data as AdminProductApi), ...prev])
      router.refresh()
    } catch {
      setTableError("Network error while duplicating. Please try again.")
    } finally {
      setDuplicatingIds((prev) => { const s = new Set(prev); s.delete(product.id); return s })
    }
  }, [duplicatingIds, router])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ProductStats
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
        revenue={stats.revenue}
      />

      {/* Transient error banner (e.g. duplicate failure) */}
      {tableError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{tableError}</span>
          <button
            type="button"
            className="ml-4 shrink-0 rounded p-0.5 hover:bg-destructive/20"
            onClick={() => setTableError(null)}
            aria-label="Dismiss error"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                {stats.total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                {stats.active}
              </span>
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive
              <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                {stats.inactive}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-60"
            />
          </div>

          <Button size="sm" className="h-9 gap-1.5" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create Product</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Create Product Modal */}
      <ProductFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        product={null}
        onCreated={(newProduct) => setProducts((prev) => [newProduct, ...prev])}
      />

      {/* Edit Product Modal */}
      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(open) => { if (!open) setEditProduct(null) }}
        product={editProduct}
        onUpdated={(updated) =>
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        }
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmDialog
        product={deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onDeleted={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16" />
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Stock</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Sold</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <EmptyBoxIcon className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm">No products found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow
                  key={product.id}
                  className={product.status === "Inactive" ? "opacity-60" : ""}
                >
                  {/* Image */}
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={resolveProductImageUrl(product.image)}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>

                  {/* Name + ID */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {product.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {product.id}
                      </p>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="outline" className={categoryBadgeClass(product.category)}>
                      {product.category}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="hidden md:table-cell">
                    <span className="font-medium text-card-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="hidden text-right lg:table-cell">
                    <span className={`font-mono text-sm ${stockClass(product.stock, product.lowStockThreshold)}`}>
                      {formatStock(product.stock, product.lowStockThreshold)}
                    </span>
                  </TableCell>

                  {/* Sold */}
                  <TableCell className="hidden text-right font-mono text-sm text-card-foreground lg:table-cell">
                    {product.sold.toLocaleString("en-NG")}
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {togglingIds.has(product.id) ? (
                        <svg className="h-4 w-4 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24" aria-label="Updating…">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                        </svg>
                      ) : (
                        <Switch
                          checked={product.status === "Active"}
                          onCheckedChange={() => toggleStatus(product.id)}
                          aria-label={`Toggle ${product.name} status`}
                        />
                      )}
                      {toggleErrorIds.has(product.id) ? (
                        <span className="text-xs font-medium text-destructive" title="Failed to update status. Please try again.">
                          Error
                        </span>
                      ) : (
                        <span className={`text-xs font-medium ${product.status === "Active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {product.status}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Edit ${product.name}`} onClick={() => setEditProduct(product)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <EllipsisIcon className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditProduct(product)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => viewInStore(product)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View in Store
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateProduct(product)}
                            disabled={duplicatingIds.has(product.id)}
                          >
                            {duplicatingIds.has(product.id) ? (
                              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                              </svg>
                            ) : (
                              <CopyIcon className="mr-2 h-4 w-4" />
                            )}
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteCandidate(product)}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-card-foreground">{filtered.length}</span> of{" "}
          <span className="font-bold text-card-foreground">{products.length}</span> products
        </p>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Total sold: <span className="font-bold text-card-foreground">{products.reduce((s, p) => s + p.sold, 0).toLocaleString("en-NG")}</span> units
        </p>
      </div>
    </div>
  )
}
