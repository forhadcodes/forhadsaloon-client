"use client"

import { useState } from "react"
import { LogOutIcon, MenuIcon } from "lucide-react"

import { NavLink } from "@/components/layout/nav-link"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSignOut } from "@/hooks/use-sign-out"
import {
  DASHBOARD_HOME,
  PUBLIC_NAV_LINKS,
  ROUTES,
} from "@/lib/constants"
import type { CurrentUser } from "@/lib/types"

type MobileNavProps = {
  user: CurrentUser | null
  isLoading: boolean
}

/** Slide-in navigation for tablets and phones. */
export function MobileNav({ user, isLoading }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const { handleSignOut, isSigningOut } = useSignOut()
  const closeMenu = () => setOpen(false)

  async function onLogout() {
    await handleSignOut()
    closeMenu()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon aria-hidden />
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-xs gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <Logo />
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse SalonBook pages or manage your account.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-3">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                variant="block"
                onNavigate={closeMenu}
              />
            ))}
          </nav>

          <div className="my-3 h-px bg-border" aria-hidden />

          {isLoading ? (
            <div className="flex flex-col gap-2 p-1" aria-hidden>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ) : user ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <NavLink
                href={DASHBOARD_HOME[user.role]}
                label="Dashboard"
                variant="block"
                onNavigate={closeMenu}
              />
              <Button
                variant="destructive"
                size="lg"
                className="justify-start"
                disabled={isSigningOut}
                onClick={() => void onLogout()}
              >
                <LogOutIcon aria-hidden />
                {isSigningOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-1">
              <LinkButton
                href={ROUTES.signIn}
                variant="outline"
                size="lg"
                onClick={closeMenu}
              >
                Sign In
              </LinkButton>
              <LinkButton
                href={ROUTES.signUp}
                variant="brand"
                size="lg"
                onClick={closeMenu}
              >
                Sign Up
              </LinkButton>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
