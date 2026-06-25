import { AlertTriangle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
  isSubmitting: boolean
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmer',
  onCancel,
  onConfirm,
  isSubmitting,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onCancel()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onCancel])

  return (
    <div className="modal-backdrop">
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <span className="confirm-dialog__icon">
          <AlertTriangle />
        </span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div>
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            className="confirm-dialog__danger"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? 'Suppression...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
