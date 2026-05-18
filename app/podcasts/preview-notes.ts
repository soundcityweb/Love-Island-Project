/** Plain-text preview for episode notes (strips simple HTML, truncates). */
export function previewNotes(notes: string | null, maxLen = 140): string {
  if (!notes?.trim()) {
    return "Fresh drops from the villa — hit play and get into it."
  }
  const text = notes
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen).trim()}…`
}
