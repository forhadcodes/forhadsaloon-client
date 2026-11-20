"use client"

import { Modal } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/spinner"

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn btn-outline min-h-11" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn min-h-11 ${destructive ? "btn-error" : "btn-primary"}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && <Spinner />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-base-content/70">{message}</p>
    </Modal>
  )
}
