import { ArrowLeft, Images } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAlbumDetails } from '../../services/publicService'
import type { Album, Photo } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './GalleryPage.css'

function AlbumPage() {
  const { id } = useParams()
  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [error, setError] = useState('')
  const routeError = id ? '' : 'Album introuvable'

  useEffect(() => {
    const controller = new AbortController()
    if (!id) {
      return () => controller.abort()
    }
    getAlbumDetails(id, controller.signal)
      .then((data) => {
        setAlbum(data.album)
        setPhotos(data.photos)
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Erreur')
        }
      })
    return () => controller.abort()
  }, [id])

  return (
    <main className="public-album">
      <header>
        <Link to="/galerie"><ArrowLeft size={17} /> Retour à la galerie</Link>
        <span>Album photo</span>
        <h1>{album?.title || (error ? 'Album introuvable' : 'Chargement...')}</h1>
        {album?.description && <p>{album.description}</p>}
      </header>
      <section className="public-album__grid">
        {error || routeError ? (
          <p className="public-gallery__empty">{error || routeError}</p>
        ) : photos.length ? (
          photos.map((photo) => (
            <figure key={photo._id}>
              <img src={getAssetUrl(photo.image)} alt={photo.caption || ''} />
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          ))
        ) : album ? (
          <p className="public-gallery__empty">
            <Images /> Cet album ne contient pas encore de photo.
          </p>
        ) : null}
      </section>
    </main>
  )
}

export default AlbumPage
