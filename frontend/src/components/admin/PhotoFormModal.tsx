import { ImagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Photo, PhotoPayload } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './GalleryFormModal.css'

interface PhotoFormValues {
  caption: string
  displayOrder: string
  image: File | null
}

interface PhotoFormModalProps {
  photo: Photo | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (form: PhotoPayload) => void | Promise<void>
}

function PhotoFormModal({
  photo,
  isSubmitting,
  onClose,
  onSubmit,
}: PhotoFormModalProps) {
  const [form, setForm] = useState<PhotoFormValues>({
    caption: photo?.caption || '',
    displayOrder: String(photo?.displayOrder ?? 0),
    image: null,
  })
  const [previewUrl, setPreviewUrl] = useState(getAssetUrl(photo?.image))

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
    setPreviewUrl(file ? URL.createObjectURL(file) : getAssetUrl(photo?.image))
    setForm((current) => ({ ...current, image: file }))
  }

  return (
    <div className="modal-backdrop">
      <section className="gallery-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span>Photo</span>
            <h2>{photo ? 'Modifier la photo' : 'Ajouter une photo'}</h2>
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
            onSubmit({ ...form, displayOrder: Number(form.displayOrder) })
          }}
        >
          <label className="gallery-image-field">
            Image {photo ? '' : '*'}
            <span>
              {previewUrl ? <img src={previewUrl} alt="Aperçu" /> : <ImagePlus />}
              <strong>{form.image?.name || 'Choisir une image'}</strong>
              <small>JPEG, PNG, WebP ou GIF, 5 Mo maximum.</small>
            </span>
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              type="file"
              required={!photo}
              onChange={handleImage}
            />
          </label>
          <label>
            Légende
            <input
              value={form.caption}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  caption: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Ordre d'affichage
            <input
              min="0"
              type="number"
              value={form.displayOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayOrder: event.target.value,
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

export default PhotoFormModal
