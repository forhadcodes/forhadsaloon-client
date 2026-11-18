"use client"

import { Logo } from "@/components/layout/logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { NavLink } from "@/components/layout/nav-link"
import { UserMenu } from "@/components/layout/user-menu"
import { LinkButton } from "@/components/ui/link-button"
import { useCurrentUser } from "@/hooks/use-current-user"
import { PUBLIC_NAV_LINKS, ROUTES } from "@/lib/constants"

/**
 * Site header.
 *
 * Public links are always visible. The right-hand side swaps between
 * Sign In / Sign Up and the profile dropdown based on the Better Auth
 * session, so it updates immediately after login or logout.
 */
export function Navbar() {
  const { user, isLoading } = useCurrentUser()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav
          aria-label="Main"
          className="hidden items-center gap-6 md:flex"
        >
          {PUBLIC_NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <div
              aria-hidden
              className="h-9 w-24 animate-pulse rounded-full bg-muted"
            />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <LinkButton
                href={ROUTES.signIn}
                variant="ghost"
                size="lg"
              >
                Sign In
              </LinkButton>
              <LinkButton href={ROUTES.signUp} variant="brand" size="lg">
                Sign Up
              </LinkButton>
            </div>
          )}

          <MobileNav user={user} isLoading={isLoading} />
        </div>
      </div>
    </header>
  )
}
