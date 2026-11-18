type AuthDividerProps = {
  label?: string
}

/** Thin "or" separator between the credentials form and social login. */
export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
