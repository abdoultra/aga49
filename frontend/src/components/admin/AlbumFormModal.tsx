import { ImagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Album, AlbumPayload } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './GalleryFormModal.css'

interface AlbumFormValues {
  title: string
  description: string
  coverImage: File | null
}

interface AlbumFormModalProps {
  album: Album | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (form: AlbumPayload) => void | Promise<void>
}

function AlbumFormModal({
  album,
  isSubmitting,
  onClose,
  onSubmit,
}: AlbumFormModalProps) {
  const [form, setForm] = useState<AlbumFormValues>({
    title: album?.title || '',
    description: album?.description || '',
    coverImage: null,
  })
  const [previewUrl, setPreviewUrl] = useState(getAssetUrl(album?.coverImage))

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

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : getAssetUrl(album?.coverImage))
    setForm((current) => ({ ...current, coverImage: file }))
  }

  return (
    <div className="modal-backdrop">
      <section className="gallery-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span>Galerie</span>
            <h2>{album ? "Modifier l'album" : 'Créer un album'}</h2>
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
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label className="gallery-image-field">
            Couverture
            <span>
              {previewUrl ? <img src={previewUrl} alt="Aperçu" /> : <ImagePlus />}
              <strong>
                {form.coverImage?.name ||
                  (album?.coverImage
                    ? 'Remplacer la couverture'
                    : 'Choisir une couverture')}
              </strong>
              <small>Facultative : la première photo pourra devenir la couverture.</small>
            </span>
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              type="file"
              onChange={handleImage}
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

export default AlbumFormModal
