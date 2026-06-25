import { ArrowRight, Images } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAlbums } from '../../services/publicService'
import type { Album } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './GalleryPage.css'

function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getAlbums(controller.signal)
      .then(setAlbums)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Erreur')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="public-gallery">
      <header className="public-gallery__hero">
        <span>La vie de l'association en images</span>
        <h1>Galerie</h1>
        <p>Retrouvez les événements, rencontres et moments partagés par l'AGA.</p>
      </header>
      <section className="public-gallery__grid">
        {isLoading ? (
          <p className="public-gallery__empty">Chargement de la galerie...</p>
        ) : error ? (
          <p className="public-gallery__empty">{error}</p>
        ) : albums.length ? (
          albums.map((album) => (
            <Link to={`/galerie/${album._id}`} key={album._id}>
              <span className="public-gallery__cover">
                {album.coverImage ? (
                  <img src={getAssetUrl(album.coverImage)} alt="" />
                ) : (
                  <Images />
                )}
              </span>
              <span className="public-gallery__copy">
                <small>{album.photoCount || 0} photo(s)</small>
                <strong>{album.title}</strong>
                <span>{album.description || 'Découvrir cet album'}</span>
                <b>Voir l'album <ArrowRight size={15} /></b>
              </span>
            </Link>
          ))
        ) : (
          <p className="public-gallery__empty">
            Les premiers albums seront bientôt disponibles.
          </p>
        )}
      </section>
    </main>
  )
}

export default GalleryPage
