"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

type LinkButtonProps = Omit<
  ComponentProps<typeof Button>,
  "render" | "nativeButton"
> & {
  href: string
}

/**
 * A Button that navigates instead of submitting.
 *
 * Base UI Buttons expect a native <button> unless told otherwise, so this
 * wrapper sets `nativeButton={false}` once instead of at every call site.
 */
export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button nativeButton={false} render={<Link href={href} />} {...props} />
}
