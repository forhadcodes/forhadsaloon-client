"use client"

import { LogOut, Menu } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSignOut } from "@/hooks/use-sign-out"
import type { CurrentUser } from "@/lib/types"

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return initials || "SB"
}

type DashboardTopBarProps = {
  user: CurrentUser
  onOpenMenu: () => void
}

export function DashboardTopBar({ user, onOpenMenu }: DashboardTopBarProps) {
  const { handleSignOut, isSigningOut } = useSignOut()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-base-300 bg-base-100 px-4 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon-lg"
        className="lg:hidden"
        aria-label="Open dashboard menu"
        onClick={onOpenMenu}
      >
        <Menu aria-hidden />
      </Button>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm leading-tight font-medium">{user.name}</p>
          <p className="truncate text-xs text-base-content/60">{user.email}</p>
        </div>

        <Avatar size="sm">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback className="text-[0.65rem] font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="outline"
          size="sm"
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
        >
          <LogOut aria-hidden />
          <span className="hidden sm:inline">{isSigningOut ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>
    </header>
  )
}
