import { FileUp, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type {
  DocumentCategory,
  DocumentPayload,
  DocumentResource,
  PublicationStatus,
} from '../../types/api'
import './DocumentFormModal.css'

interface DocumentFormValues {
  title: string
  description: string
  category: DocumentCategory
  status: PublicationStatus
  publicationDate: string
  file: File | null
}

interface DocumentFormModalProps {
  resource: DocumentResource | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (form: DocumentPayload) => void | Promise<void>
}

const toDate = (value?: string | Date) =>
  value ? new Date(value).toISOString().slice(0, 10) : ''

function DocumentFormModal({
  resource,
  isSubmitting,
  onClose,
  onSubmit,
}: DocumentFormModalProps) {
  const [form, setForm] = useState<DocumentFormValues>({
    title: resource?.title || '',
    description: resource?.description || '',
    category: resource?.category || 'other',
    status: resource?.status || 'draft',
    publicationDate: toDate(resource?.publicationDate || new Date()),
    file: null,
  })

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onClose])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="modal-backdrop">
      <section className="document-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span>Ressources</span>
            <h2>{resource ? 'Modifier le document' : 'Ajouter un document'}</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer le formulaire"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X />
          </button>
        </header>

        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            onSubmit(form)
          }}
        >
          <label>
            Titre *
            <input
              autoFocus
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="document-form__row">
            <label>
              Catégorie
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="administratif">Administratif</option>
                <option value="association">Association</option>
                <option value="compte-rendu">Compte rendu</option>
                <option value="formulaire">Formulaire</option>
                <option value="other">Autre</option>
              </select>
            </label>
            <label>
              Statut
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </label>
          </div>

          <label>
            Date de publication
            <input
              name="publicationDate"
              type="date"
              value={form.publicationDate}
              onChange={handleChange}
            />
          </label>

          <label className="document-file-field">
            Fichier {resource ? '' : '*'}
            <span>
              <FileUp />
              <strong>
                {form.file?.name ||
                  resource?.originalName ||
                  'Choisir un fichier'}
              </strong>
              <small>PDF, Word, Excel ou TXT, 10 Mo maximum</small>
            </span>
            <input
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              type="file"
              required={!resource}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((current) => ({
                  ...current,
                  file: event.target.files?.[0] || null,
                }))
              }
            />
          </label>

          <footer>
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default DocumentFormModal
