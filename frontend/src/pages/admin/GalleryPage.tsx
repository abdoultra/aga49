import {
  Images,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AlbumFormModal from '../../components/admin/AlbumFormModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PhotoFormModal from '../../components/admin/PhotoFormModal'
import {
  createAlbum,
  createPhoto,
  deleteAlbum,
  deletePhoto,
  getAlbum,
  getAlbums,
  updateAlbum,
  updatePhoto,
} from '../../services/galleryService'
import type {
  Album,
  AlbumPayload,
  ApiError,
  EntityId,
  Photo,
  PhotoPayload,
} from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './GalleryPage.css'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError
    const data = apiError.data as { errors?: string[] } | undefined
    return data?.errors?.join('. ') || error.message
  }

  return 'Une erreur inattendue est survenue'
}

const comparePhotos = (first: Photo, second: Photo) =>
  (first.displayOrder ?? 0) - (second.displayOrder ?? 0)

function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [albumFormOpen, setAlbumFormOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [photoFormOpen, setPhotoFormOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null)

  const selectAlbum = (albumId: EntityId | '') => {
    setIsLoadingPhotos(Boolean(albumId))
    setSelectedAlbumId(albumId)
  }

  useEffect(() => {
    const controller = new AbortController()

    getAlbums(controller.signal)
      .then((items) => {
        setAlbums(items)
        if (items[0]) selectAlbum(items[0]._id)
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selectedAlbumId) return undefined

    const controller = new AbortController()

    getAlbum(selectedAlbumId, controller.signal)
      .then(({ photos: items }) => setPhotos(items))
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPhotos(false)
      })

    return () => controller.abort()
  }, [selectedAlbumId])

  const selectedAlbum = albums.find(
    (album) => album._id === selectedAlbumId,
  )

  const filteredAlbums = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return albums.filter((album) =>
      `${album.title} ${album.description || ''}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [albums, query])

  const totalPhotos = albums.reduce(
    (sum, album) => sum + (album.photoCount || 0),
    0,
  )

  const closeForms = () => {
    setAlbumFormOpen(false)
    setPhotoFormOpen(false)
    setEditingAlbum(null)
    setEditingPhoto(null)
  }

  const handleAlbumSave = async (form: AlbumPayload) => {
    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      if (editingAlbum) {
        const updated = await updateAlbum(editingAlbum._id, form)
        setAlbums((current) =>
          current.map((album) =>
            album._id === updated._id
              ? { ...album, ...updated }
              : album,
          ),
        )
        setNotice("L'album a été modifié.")
      } else {
        const created = await createAlbum(form)
        const album = { ...created, photoCount: 0 }
        setAlbums((current) => [album, ...current])
        selectAlbum(album._id)
        setNotice("L'album a été créé.")
      }
      closeForms()
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoSave = async (form: PhotoPayload) => {
    if (!selectedAlbumId) return
    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      if (editingPhoto) {
        const updated = await updatePhoto(editingPhoto._id, form)
        setPhotos((current) =>
          current
            .map((photo) => (photo._id === updated._id ? updated : photo))
            .sort(comparePhotos),
        )
        if (selectedAlbum?.coverImage === editingPhoto.image) {
          setAlbums((current) =>
            current.map((album) =>
              album._id === selectedAlbumId
                ? { ...album, coverImage: updated.image }
                : album,
            ),
          )
        }
        setNotice('La photo a été modifiée.')
      } else {
        const created = await createPhoto(selectedAlbumId, form)
        setPhotos((current) =>
          [...current, created].sort(comparePhotos),
        )
        setAlbums((current) =>
          current.map((album) =>
            album._id === selectedAlbumId
              ? {
                  ...album,
                  photoCount: (album.photoCount || 0) + 1,
                  coverImage: album.coverImage || created.image,
                }
              : album,
          ),
        )
        setNotice('La photo a été ajoutée.')
      }
      closeForms()
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAlbumDelete = async () => {
    if (!albumToDelete) return
    setIsSubmitting(true)
    setError('')

    try {
      await deleteAlbum(albumToDelete._id)
      const remaining = albums.filter(
        (album) => album._id !== albumToDelete._id,
      )
      setAlbums(remaining)
      if (selectedAlbumId === albumToDelete._id) {
        selectAlbum(remaining[0]?._id || '')
        if (remaining.length === 0) setPhotos([])
      }
      setAlbumToDelete(null)
      setNotice("L'album et ses photos ont été supprimés.")
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoDelete = async () => {
    if (!photoToDelete) return
    setIsSubmitting(true)
    setError('')

    try {
      await deletePhoto(photoToDelete._id)
      const remaining = photos.filter(
        (photo) => photo._id !== photoToDelete._id,
      )
      setPhotos(remaining)
      setAlbums((current) =>
        current.map((album) =>
          album._id === selectedAlbumId
            ? {
                ...album,
                photoCount: Math.max(0, (album.photoCount || 0) - 1),
                coverImage:
                  album.coverImage === photoToDelete.image
                    ? remaining[0]?.image || ''
                    : album.coverImage,
              }
            : album,
        ),
      )
      setPhotoToDelete(null)
      setNotice('La photo a été supprimée.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="gallery-page">
      <div className="gallery-page__heading">
        <div>
          <p>Médiathèque</p>
          <h1>Galerie</h1>
          <span>Organisez les souvenirs de l'association par albums.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAlbum(null)
            setAlbumFormOpen(true)
          }}
        >
          <Plus size={18} />
          Créer un album
        </button>
      </div>

      {error && (
        <p className="gallery-alert gallery-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="gallery-alert gallery-alert--success" role="status">
          {notice}
        </p>
      )}

      <section className="gallery-stats">
        <article>
          <span><Images /></span>
          <div><small>Albums</small><strong>{albums.length}</strong></div>
        </article>
        <article>
          <span><ImagePlus /></span>
          <div><small>Photos</small><strong>{totalPhotos}</strong></div>
        </article>
      </section>

      <section className="albums-panel">
        <div className="gallery-toolbar">
          <label>
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher un album..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span>{filteredAlbums.length} album(s)</span>
        </div>

        <div className="albums-grid">
          {isLoading ? (
            <p className="gallery-empty">Chargement des albums...</p>
          ) : filteredAlbums.length ? (
            filteredAlbums.map((album) => (
              <article
                className={`album-card ${
                  album._id === selectedAlbumId ? 'album-card--active' : ''
                }`}
                key={album._id}
              >
                <button
                  type="button"
                  className="album-card__select"
                  onClick={() => selectAlbum(album._id)}
                >
                  <span className="album-card__cover">
                    {album.coverImage ? (
                      <img src={getAssetUrl(album.coverImage)} alt="" />
                    ) : (
                      <Images />
                    )}
                  </span>
                  <span className="album-card__copy">
                    <strong>{album.title}</strong>
                    <small>{album.photoCount || 0} photo(s)</small>
                  </span>
                </button>
                <div className="album-card__actions">
                  <button
                    type="button"
                    aria-label={`Modifier ${album.title}`}
                    onClick={() => {
                      setEditingAlbum(album)
                      setAlbumFormOpen(true)
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Supprimer ${album.title}`}
                    onClick={() => setAlbumToDelete(album)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="gallery-empty">Aucun album ne correspond.</p>
          )}
        </div>
      </section>

      <section className="photos-panel">
        <header>
          <div>
            <p>Album sélectionné</p>
            <h2>{selectedAlbum?.title || 'Aucun album'}</h2>
            {selectedAlbum?.description && (
              <span>{selectedAlbum.description}</span>
            )}
          </div>
          <button
            type="button"
            disabled={!selectedAlbum}
            onClick={() => {
              setEditingPhoto(null)
              setPhotoFormOpen(true)
            }}
          >
            <ImagePlus size={17} />
            Ajouter une photo
          </button>
        </header>

        <div className="photos-grid">
          {isLoadingPhotos ? (
            <p className="gallery-empty">Chargement des photos...</p>
          ) : photos.length ? (
            photos.map((photo) => (
              <article className="photo-card" key={photo._id}>
                <img src={getAssetUrl(photo.image)} alt={photo.caption || ''} />
                <div>
                  <span>{photo.caption || 'Sans légende'}</span>
                  <small>Ordre : {photo.displayOrder}</small>
                </div>
                <footer>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPhoto(photo)
                      setPhotoFormOpen(true)
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => setPhotoToDelete(photo)}>
                    <Trash2 size={15} />
                  </button>
                </footer>
              </article>
            ))
          ) : (
            <p className="gallery-empty">
              {selectedAlbum
                ? 'Cet album ne contient pas encore de photo.'
                : 'Créez ou sélectionnez un album.'}
            </p>
          )}
        </div>
      </section>

      {albumFormOpen && (
        <AlbumFormModal
          album={editingAlbum}
          isSubmitting={isSubmitting}
          onClose={closeForms}
          onSubmit={handleAlbumSave}
        />
      )}
      {photoFormOpen && (
        <PhotoFormModal
          photo={editingPhoto}
          isSubmitting={isSubmitting}
          onClose={closeForms}
          onSubmit={handlePhotoSave}
        />
      )}
      {albumToDelete && (
        <ConfirmDialog
          title="Supprimer cet album ?"
          message={`« ${albumToDelete.title} » et toutes ses photos seront supprimés définitivement.`}
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setAlbumToDelete(null)}
          onConfirm={handleAlbumDelete}
        />
      )}
      {photoToDelete && (
        <ConfirmDialog
          title="Supprimer cette photo ?"
          message="Le fichier image sera également supprimé du serveur."
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setPhotoToDelete(null)}
          onConfirm={handlePhotoDelete}
        />
      )}
    </main>
  )
}

export default GalleryPage
