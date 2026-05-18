"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ── Public types ──────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique identifier used for sort tracking */
  id: string
  /** Column header label */
  header: string
  /** Renders the cell content for a given row */
  cell: (row: T) => ReactNode
  /**
   * Return a primitive used for client-side sorting.
   * When omitted the column is not sortable even if `sortable: true`.
   */
  sortValue?: (row: T) => string | number
  /** Whether clicking the header sorts by this column */
  sortable?: boolean
  /** Tailwind width class — e.g. "w-[160px]" or "w-40" */
  width?: string
  align?: "left" | "center" | "right"
  /** Hide the column below the `md` breakpoint */
  hideOnMobile?: boolean
  /** Extra class(es) applied to every `<td>` in this column */
  className?: string
}

export interface RowAction<T> {
  label: string
  icon?: LucideIcon
  onClick: (row: T) => void
  /** Conditionally hide this action for specific rows */
  hidden?: (row: T) => boolean
  /** Conditionally disable this action */
  disabled?: (row: T) => boolean
  /** "danger" renders the item in destructive colour */
  variant?: "default" | "danger"
  /** Render a divider above this item */
  separator?: boolean
}

export interface AdminDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  /** Must return a stable, unique string for each row */
  rowKey: (row: T) => string

  // ── Row actions ────────────────────────────────────────────────────────────
  /** Actions rendered in a per-row "⋯" dropdown */
  actions?: RowAction<T>[]

  // ── Search ────────────────────────────────────────────────────────────────
  searchable?: boolean
  searchPlaceholder?: string
  /**
   * Controlled search query for server-side search.
   * When provided together with `onSearchChange`, the component acts as
   * controlled; otherwise it manages the query internally.
   */
  searchQuery?: string
  onSearchChange?: (query: string) => void

  // ── Sorting ───────────────────────────────────────────────────────────────
  defaultSort?: { id: string; direction: "asc" | "desc" }

  // ── Pagination ─────────────────────────────────────────────────────────────
  pageSize?: number
  pageSizeOptions?: number[]
  /**
   * For server-side pagination: total number of rows across all pages.
   * When omitted, the component paginates `data` locally.
   */
  totalRows?: number
  /** Controlled current page (1-based) — use with `onPageChange` */
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void

  // ── Row selection ─────────────────────────────────────────────────────────
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  emptyDescription?: string

  // ── Toolbar ───────────────────────────────────────────────────────────────
  /** Slot rendered to the right of the search bar */
  toolbarContent?: ReactNode

  // ── Style ─────────────────────────────────────────────────────────────────
  className?: string
  stickyHeader?: boolean
}

// ── Pre-built action helpers (re-exported for consumer convenience) ───────────

export function viewAction<T>(onClick: (row: T) => void): RowAction<T> {
  return { label: "View", icon: Eye, onClick }
}
export function editAction<T>(onClick: (row: T) => void): RowAction<T> {
  return { label: "Edit", icon: Pencil, onClick }
}
export function deleteAction<T>(onClick: (row: T) => void): RowAction<T> {
  return { label: "Delete", icon: Trash2, onClick, variant: "danger", separator: true }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc"

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}

function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminDataTable<T>({
  data,
  columns,
  rowKey,
  actions,
  searchable = true,
  searchPlaceholder = "Search…",
  searchQuery: controlledQuery,
  onSearchChange,
  defaultSort,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  totalRows,
  currentPage: controlledPage,
  onPageChange,
  onPageSizeChange,
  selectable = false,
  onSelectionChange,
  isLoading = false,
  skeletonRows = 6,
  emptyMessage = "No results found",
  emptyDescription = "Try adjusting your search or filters",
  toolbarContent,
  className,
  stickyHeader = true,
}: AdminDataTableProps<T>) {
  // ── Search state ────────────────────────────────────────────────────────
  const isControlledSearch = controlledQuery !== undefined
  const [localQuery, setLocalQuery] = useState("")
  const query = isControlledSearch ? controlledQuery : localQuery
  const debouncedQuery = useDebounce(query)

  const handleQueryChange = (q: string) => {
    if (!isControlledSearch) setLocalQuery(q)
    onSearchChange?.(q)
  }

  // ── Sort state ──────────────────────────────────────────────────────────
  const [sortId, setSortId] = useState<string | null>(defaultSort?.id ?? null)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort?.direction ?? "asc")

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable || !col.sortValue) return
    if (sortId === col.id) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortId(col.id)
      setSortDir("asc")
    }
  }

  // ── Pagination state ────────────────────────────────────────────────────
  const isControlledPage = controlledPage !== undefined
  const [localPage, setLocalPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const page = isControlledPage ? controlledPage : localPage

  const handlePageChange = (p: number) => {
    if (!isControlledPage) setLocalPage(p)
    onPageChange?.(p)
  }

  const handlePageSizeChange = (s: number) => {
    setPageSize(s)
    handlePageChange(1)
    onPageSizeChange?.(s)
  }

  // Reset to page 1 when search changes
  useEffect(() => {
    if (!isControlledPage) setLocalPage(1)
  }, [debouncedQuery, isControlledPage])

  // ── Selection state ─────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleRow = (id: string, row: T) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      if (onSelectionChange) {
        const selectedRows = data.filter((r) => next.has(rowKey(r)))
        onSelectionChange(selectedRows)
      }
      return next
    })
  }

  const toggleAll = (rows: T[]) => {
    const ids = rows.map(rowKey)
    const allSelected = ids.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      if (onSelectionChange) {
        const selectedRows = data.filter((r) => next.has(rowKey(r)))
        onSelectionChange(selectedRows)
      }
      return next
    })
  }

  // ── Derived data ────────────────────────────────────────────────────────
  const serverSidePagination = isControlledPage && onPageChange !== undefined

  const processedData = useMemo(() => {
    // When server handles search/pagination, skip local processing
    if (serverSidePagination) return data

    let rows = [...data]

    // Filter
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      rows = rows.filter((row) =>
        columns.some((col) => {
          if (!col.sortValue) return false
          return String(col.sortValue(row)).toLowerCase().includes(q)
        }) ||
        // Fallback: search all string values on the row object
        Object.values(row as Record<string, unknown>).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(q),
        ),
      )
    }

    // Sort
    if (sortId) {
      const col = columns.find((c) => c.id === sortId)
      if (col?.sortValue) {
        rows.sort((a, b) => {
          const va = col.sortValue!(a)
          const vb = col.sortValue!(b)
          const cmp = typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va).localeCompare(String(vb), undefined, { numeric: true })
          return sortDir === "asc" ? cmp : -cmp
        })
      }
    }

    return rows
  }, [data, columns, debouncedQuery, sortId, sortDir, serverSidePagination])

  const totalCount = totalRows ?? processedData.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const visibleRows = serverSidePagination
    ? data
    : processedData.slice((page - 1) * pageSize, page * pageSize)

  // Selection state helpers
  const visibleKeys = visibleRows.map(rowKey)
  const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k))
  const someVisibleSelected = visibleKeys.some((k) => selected.has(k)) && !allVisibleSelected

  // Total column count (including checkbox + actions columns)
  const totalCols = columns.length + (selectable ? 1 : 0) + (actions?.length ? 1 : 0)

  const showFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const showTo   = Math.min(page * pageSize, totalCount)

  return (
    <div className={cn("flex flex-col", className)}>

      {/* ── Toolbar ──────────────────────────────────── */}
      {(searchable || toolbarContent) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          {/* Search */}
          {searchable && (
            <label className="group flex w-full cursor-text items-center gap-2 rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 sm:w-64 lg:w-72">
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search table"
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          )}

          {/* Right-side toolbar slot */}
          {toolbarContent && (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {toolbarContent}
            </div>
          )}
        </div>
      )}

      {/* ── Selection banner ─────────────────────────── */}
      {selectable && selected.size > 0 && (
        <div className="flex items-center gap-3 border-b border-primary/20 bg-primary/5 px-4 py-2 text-sm">
          <span className="font-medium text-primary">
            {selected.size} {selected.size === 1 ? "row" : "rows"} selected
          </span>
          <button
            onClick={() => {
              setSelected(new Set())
              onSelectionChange?.([])
            }}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────── */}
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">

          {/* Head */}
          <thead
            className={cn(
              "[&_tr]:border-b",
              stickyHeader && "sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]",
            )}
          >
            <tr>
              {/* Checkbox */}
              {selectable && (
                <th className="h-11 w-10 px-3 text-left">
                  <Checkbox
                    checked={allVisibleSelected}
                    data-indeterminate={someVisibleSelected || undefined}
                    onCheckedChange={() => toggleAll(visibleRows)}
                    aria-label="Select all visible rows"
                    className={cn(someVisibleSelected && "data-[state=checked]:bg-muted")}
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortId === col.id
                const canSort = col.sortable && !!col.sortValue
                return (
                  <th
                    key={col.id}
                    className={cn(
                      "h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      col.width,
                      col.align === "center" && "text-center",
                      col.align === "right"  && "text-right",
                      col.hideOnMobile && "hidden md:table-cell",
                      canSort && "cursor-pointer select-none hover:text-foreground",
                    )}
                    onClick={() => canSort && handleSort(col)}
                    aria-sort={
                      isSorted
                        ? sortDir === "asc" ? "ascending" : "descending"
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {canSort && (
                        <SortIcon active={isSorted} dir={sortDir} />
                      )}
                    </span>
                  </th>
                )
              })}

              {/* Actions column */}
              {actions && actions.length > 0 && (
                <th className="h-11 w-12 px-3 text-right" aria-label="Row actions" />
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <SkeletonRows rows={skeletonRows} cols={totalCols} />
            ) : visibleRows.length === 0 ? (
              <EmptyRow
                colSpan={totalCols}
                message={emptyMessage}
                description={emptyDescription}
              />
            ) : (
              visibleRows.map((row) => {
                const key  = rowKey(row)
                const isSelected = selected.has(key)
                return (
                  <tr
                    key={key}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "border-b transition-colors",
                      "hover:bg-muted/40",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    {/* Checkbox */}
                    {selectable && (
                      <td className="px-3 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(key, row)}
                          aria-label={`Select row ${key}`}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "px-4 py-3 align-middle",
                          col.align === "center" && "text-center",
                          col.align === "right"  && "text-right",
                          col.hideOnMobile && "hidden md:table-cell",
                          col.className,
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}

                    {/* Row actions dropdown */}
                    {actions && actions.length > 0 && (
                      <td className="px-3 py-3 text-right">
                        <ActionsDropdown row={row} actions={actions} />
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ─────────────────────────── */}
      {!isLoading && totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {/* Left: count */}
          <p className="shrink-0">
            Showing{" "}
            <span className="font-medium text-foreground">{showFrom}–{showTo}</span>
            {" "}of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>
            {" "}results
          </p>

          {/* Center: page numbers */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {/* Right: page size */}
          <div className="flex items-center gap-2">
            <span className="shrink-0">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-input bg-card px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />
  return dir === "asc"
    ? <ChevronUp   className="h-3.5 w-3.5 text-primary" aria-hidden />
    : <ChevronDown className="h-3.5 w-3.5 text-primary" aria-hidden />
}

function ActionsDropdown<T>({ row, actions }: { row: T; actions: RowAction<T>[] }) {
  const visible = actions.filter((a) => !a.hidden?.(row))
  if (visible.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Row actions"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 rounded-xl border border-border bg-card shadow-xl"
      >
        {visible.map((action, i) => (
          <div key={`${action.label}-${i}`}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => action.onClick(row)}
              disabled={action.disabled?.(row)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
                action.variant === "danger"
                  ? "text-destructive focus:bg-destructive/10 focus:text-destructive"
                  : "text-muted-foreground focus:text-foreground",
              )}
            >
              {action.icon && <action.icon className="h-4 w-4 shrink-0" aria-hidden />}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(page, totalPages)

  return (
    <nav
      className="flex items-center gap-1"
      aria-label="Table pagination"
    >
      {/* First */}
      <PageButton
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        aria-label="First page"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </PageButton>

      {/* Prev */}
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </PageButton>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PageButton>
        ),
      )}

      {/* Next */}
      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </PageButton>

      {/* Last */}
      <PageButton
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </PageButton>
    </nav>
  )
}

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

function PageButton({ active, className, children, ...props }: PageButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-7 min-w-[28px] items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  )
}

function SkeletonRows({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div
                className="h-4 animate-pulse rounded-md bg-muted"
                style={{ width: `${55 + ((rowIdx * 7 + colIdx * 13) % 35)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function EmptyRow({
  colSpan,
  message,
  description,
}: {
  colSpan: number
  message: string
  description: string
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground/60" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{message}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </td>
    </tr>
  )
}
