import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Newspaper,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicPublications } from '../../services/publicService'
import type { Publication, PublicationType } from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import { formatLongDate } from '../../utils/date'
import './PublicationsPublic.css'

type ListMode = 'content' | 'events'
type TypeFilter = PublicationType | 'all'

interface PublicationsListPageProps {
  mode: ListMode
}

const typeLabels: Record<PublicationType, string> = {
  news: 'Actualité',
  announcement: 'Annonce',
  event: 'Événement',
}

function PublicationsListPage({ mode }: PublicationsListPageProps) {
  const isEvents = mode === 'events'
  const [publications, setPublications] = useState<Publication[]>([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getPublicPublications(
      isEvents ? { type: 'event', upcoming: true } : {},
      controller.signal,
    )
      .then((items) =>
        setPublications(
          isEvents
            ? items
            : items.filter((publication) => publication.type !== 'event'),
        ),
      )
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Erreur')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [isEvents])

  const visiblePublications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return publications.filter(
      (publication) =>
        (typeFilter === 'all' || publication.type === typeFilter) &&
        `${publication.title} ${publication.content} ${publication.location || ''}`
          .toLowerCase()
          .includes(normalizedQuery),
    )
  }, [publications, query, typeFilter])

  return (
    <main className="public-content">
      <header className="public-content__hero">
        <span>{isEvents ? 'Agenda associatif' : 'Vie de l’association'}</span>
        <h1>{isEvents ? 'Événements' : 'Actualités'}</h1>
        <p>
          {isEvents
            ? 'Découvrez les prochains rendez-vous organisés par l’AGA.'
            : 'Suivez les informations, annonces et actions de l’association.'}
        </p>
      </header>

      <section className="public-content__body">
        <div className="public-content__toolbar">
          <label>
            <Search size={18} />
            <input
              type="search"
              placeholder="Rechercher..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {!isEvents && (
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            >
              <option value="all">Tous les contenus</option>
              <option value="news">Actualités</option>
              <option value="announcement">Annonces</option>
            </select>
          )}
        </div>

        <div className="public-content__grid">
          {isLoading ? (
            <p className="public-content__empty">Chargement...</p>
          ) : error ? (
            <p className="public-content__empty">{error}</p>
          ) : visiblePublications.length ? (
            visiblePublications.map((publication) => (
              <article className="public-content-card" key={publication._id}>
                <Link
                  className="public-content-card__image"
                  to={`/publications/${publication._id}`}
                >
                  {publication.image ? (
                    <img src={getAssetUrl(publication.image)} alt="" />
                  ) : (
                    isEvents ? <CalendarDays /> : <Newspaper />
                  )}
                  <span>{typeLabels[publication.type]}</span>
                </Link>
                <div>
                  <time>
                    {formatLongDate(
                      publication.type === 'event'
                        ? publication.startDate
                        : publication.publicationDate,
                    )}
                  </time>
                  <h2>
                    <Link to={`/publications/${publication._id}`}>
                      {publication.title}
                    </Link>
                  </h2>
                  <p>{publication.content}</p>
                  {publication.type === 'event' && (
                    <div className="public-content-card__event">
                      {publication.location && (
                        <span><MapPin size={14} /> {publication.location}</span>
                      )}
                      <span>
                        <Clock3 size={14} />
                        {publication.startDate
                          ? new Date(publication.startDate).toLocaleTimeString(
                              'fr-FR',
                              { hour: '2-digit', minute: '2-digit' },
                            )
                          : ''}
                      </span>
                    </div>
                  )}
                  <Link
                    className="public-content-card__link"
                    to={`/publications/${publication._id}`}
                  >
                    Lire la suite <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <p className="public-content__empty">
              Aucun contenu ne correspond à la recherche.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default PublicationsListPage
