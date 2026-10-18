/** Placeholder while an admin page checks the session and loads data. */
export function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="h-12 w-48 rounded-xs bg-surface" />
      <div className="mt-12 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xs bg-surface" />
        ))}
      </div>
    </div>
  )
}
