"use client"

import * as React from "react"
import { X } from "lucide-react"

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  React.useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-neutral/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card-salon relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-heading text-xl">{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-xl hover:bg-base-200"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="text-sm">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
