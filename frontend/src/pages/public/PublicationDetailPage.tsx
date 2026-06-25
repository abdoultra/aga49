import { ArrowLeft, CalendarDays, Clock3, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicPublication } from '../../services/publicService'
import type { Publication } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import { formatLongDate } from '../../utils/date'
import './PublicationsPublic.css'

function PublicationDetailPage() {
  const { id } = useParams()
  const [publication, setPublication] = useState<Publication | null>(null)
  const [error, setError] = useState('')
  const routeError = id ? '' : 'Publication introuvable'

  useEffect(() => {
    const controller = new AbortController()
    if (!id) {
      return () => controller.abort()
    }
    getPublicPublication(id, controller.signal)
      .then(setPublication)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Erreur')
        }
      })
    return () => controller.abort()
  }, [id])

  const backPath = publication?.type === 'event' ? '/evenements' : '/actualites'

  return (
    <main className="publication-detail">
      {error || routeError ? (
        <section className="publication-detail__error">
          <h1>Publication introuvable</h1>
          <p>{error || routeError}</p>
          <Link to="/">Retour à l’accueil</Link>
        </section>
      ) : publication ? (
        <>
          <header
            className={`publication-detail__hero ${
              publication.image ? 'has-image' : ''
            }`}
            style={
              publication.image
                ? { backgroundImage: `url("${getAssetUrl(publication.image)}")` }
                : undefined
            }
          >
            <div>
              <Link to={backPath}><ArrowLeft size={17} /> Retour</Link>
              <span>{publication.type === 'event' ? 'Événement' : 'Actualité'}</span>
              <h1>{publication.title}</h1>
              <time>
                {formatLongDate(
                  publication.type === 'event'
                    ? publication.startDate
                    : publication.publicationDate,
                )}
              </time>
            </div>
          </header>
          <article className="publication-detail__content">
            {publication.type === 'event' && (
              <aside>
                <span><CalendarDays /> {publication.startDate ? new Date(publication.startDate).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : ''}</span>
                {publication.endDate && <span><Clock3 /> Fin : {new Date(publication.endDate).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</span>}
                {publication.location && <span><MapPin /> {publication.location}</span>}
              </aside>
            )}
            <p>{publication.content}</p>
            {publication.createdBy && (
              <footer>
                Publié par {publication.createdBy.prenom} {publication.createdBy.nom}
              </footer>
            )}
          </article>
        </>
      ) : (
        <p className="public-content__empty">Chargement...</p>
      )}
    </main>
  )
}

export default PublicationDetailPage
