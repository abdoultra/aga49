import { ImagePlus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Publication, PublicationPayload } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './PublicationFormModal.css'

type PublicationPageMode = 'content' | 'events'
type PublicationFormValues = PublicationPayload & {
  title: string
  content: string
  type: NonNullable<PublicationPayload['type']>
  status: NonNullable<PublicationPayload['status']>
  priority: NonNullable<PublicationPayload['priority']>
  location: string
  publicationDate: string
  startDate: string
  endDate: string
  image: File | null
}

interface PublicationFormModalProps {
  publication: Publication | null
  mode: PublicationPageMode
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (form: PublicationPayload) => void | Promise<void>
}

const toLocalDateTime = (value?: string | Date) => {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

const createEmptyPublication = (
  mode: PublicationPageMode,
): PublicationFormValues => ({
  title: '',
  content: '',
  type: mode === 'events' ? 'event' : 'news',
  status: 'draft',
  priority: 'normal',
  location: '',
  publicationDate: toLocalDateTime(new Date()),
  startDate: '',
  endDate: '',
  image: null,
})

const toFormPublication = (
  publication: Publication | null,
  mode: PublicationPageMode,
): PublicationFormValues =>
  publication
    ? {
        title: publication.title || '',
        content: publication.content || '',
        type: publication.type || (mode === 'events' ? 'event' : 'news'),
        status: publication.status || 'draft',
        priority: publication.priority || 'normal',
        location: publication.location || '',
        publicationDate: toLocalDateTime(publication.publicationDate),
        startDate: toLocalDateTime(publication.startDate),
        endDate: toLocalDateTime(publication.endDate),
        image: null,
      }
    : createEmptyPublication(mode)

function PublicationFormModal({
  publication,
  mode,
  isSubmitting,
  onClose,
  onSubmit,
}: PublicationFormModalProps) {
  const [form, setForm] = useState(() =>
    toFormPublication(publication, mode),
  )
  const [previewUrl, setPreviewUrl] = useState(
    getAssetUrl(publication?.image),
  )

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onClose])

  useEffect(
    () => () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const isEvent = form.type === 'event'
  const title = useMemo(
    () =>
      publication
        ? `Modifier ${isEvent ? "l'événement" : 'la publication'}`
        : `Créer ${isEvent ? 'un événement' : 'une publication'}`,
    [isEvent, publication],
  )

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null

    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(
      file ? URL.createObjectURL(file) : getAssetUrl(publication?.image),
    )
    setForm((current) => ({ ...current, image: file }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      ...form,
      type: mode === 'events' ? 'event' : form.type,
      startDate: isEvent ? form.startDate : '',
      endDate: isEvent ? form.endDate : '',
      location: isEvent ? form.location : '',
    })
  }

  return (
    <div className="modal-backdrop">
      <section
        className="publication-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publication-modal-title"
      >
        <header>
          <div>
            <span>{mode === 'events' ? 'Agenda' : 'Communication'}</span>
            <h2 id="publication-modal-title">{title}</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer le formulaire"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
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
            Contenu *
            <textarea
              name="content"
              rows={6}
              value={form.content}
              onChange={handleChange}
              required
            />
          </label>

          <div className="publication-form__row">
            {mode !== 'events' && (
              <label>
                Type
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="news">Actualité</option>
                  <option value="announcement">Annonce</option>
                </select>
              </label>
            )}
            <label>
              Statut
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </label>
            <label>
              Priorité
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
              </select>
            </label>
          </div>

          <label>
            Date de publication
            <input
              name="publicationDate"
              type="datetime-local"
              value={form.publicationDate}
              onChange={handleChange}
            />
          </label>

          {isEvent && (
            <>
              <label>
                Lieu
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Angers, salle, adresse..."
                />
              </label>
              <div className="publication-form__row">
                <label>
                  Début *
                  <input
                    name="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Fin
                  <input
                    min={form.startDate}
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </>
          )}

          <label className="publication-image-field">
            Image de couverture
            <span>
              {previewUrl ? (
                <img src={previewUrl} alt="Aperçu de la couverture" />
              ) : (
                <ImagePlus />
              )}
              <strong>
                {form.image?.name ||
                  (publication?.image
                    ? "Remplacer l'image actuelle"
                    : 'Choisir une image')}
              </strong>
              <small>JPEG, PNG, WebP ou GIF, 5 Mo maximum</small>
            </span>
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              name="image"
              type="file"
              onChange={handleImage}
            />
          </label>

          <footer>
            <button
              type="button"
              className="publication-form__cancel"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="publication-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default PublicationFormModal
