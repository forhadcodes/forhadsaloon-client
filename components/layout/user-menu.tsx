"use client"

import Link from "next/link"
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSignOut } from "@/hooks/use-sign-out"
import { DASHBOARD_HOME } from "@/lib/constants"
import type { CurrentUser } from "@/lib/types"

type UserMenuProps = {
  user: CurrentUser
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return initials || "SB"
}

/**
 * Profile dropdown required by the brief:
 * user name, dashboard (based on role) and logout.
 */
export function UserMenu({ user }: UserMenuProps) {
  const { handleSignOut, isSigningOut } = useSignOut()
  const dashboardHref = DASHBOARD_HOME[user.role]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="lg"
            className="h-10 gap-2 rounded-full pr-2 pl-1"
            aria-label={`Account menu for ${user.name}`}
          />
        }
      >
        <Avatar size="sm">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback className="text-[0.65rem] font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
          {user.name}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuLabel className="px-1.5 py-1.5">
          <span className="block truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={dashboardHref} />}>
          <LayoutDashboardIcon aria-hidden />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
        >
          <LogOutIcon aria-hidden />
          {isSigningOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
