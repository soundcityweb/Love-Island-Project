/**
 * Root layout for all `/admin/*` routes.
 * The dashboard shell (sidebar, navbar, auth gate) lives in `(shell)/layout.tsx`
 * so `/admin/login` can render full-screen without that chrome.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
