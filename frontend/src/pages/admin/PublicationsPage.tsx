import {
  Archive,
  CalendarDays,
  Clock3,
  Eye,
  FilePenLine,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PublicationFormModal from '../../components/admin/PublicationFormModal'
import Pagination from '../../components/common/Pagination'
import usePagination from '../../hooks/usePagination'
import {
  createPublication,
  deletePublication,
  getAdminPublications,
  updatePublication,
} from '../../services/publicationService'
import type {
  ApiError,
  Publication,
  PublicationPayload,
  PublicationStatus,
  PublicationType,
} from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import './PublicationsPage.css'

type PublicationPageMode = 'content' | 'events'
type StatusFilter = PublicationStatus | 'all'
type StatCard = [string, number, LucideIcon, string]

interface PublicationsPageProps {
  mode: PublicationPageMode
}

const statusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

const typeLabels: Record<PublicationType, string> = {
  news: 'Actualité',
  announcement: 'Annonce',
  event: 'Événement',
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError
    const data = apiError.data as { errors?: string[] } | undefined
    return data?.errors?.join('. ') || error.message
  }

  return 'Une erreur inattendue est survenue'
}

function PublicationsPage({ mode }: PublicationsPageProps) {
  const isEventsPage = mode === 'events'
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPublication, setEditingPublication] =
    useState<Publication | null>(null)
  const [publicationToDelete, setPublicationToDelete] =
    useState<Publication | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getAdminPublications(controller.signal)
      .then(setPublications)
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const scopedPublications = useMemo(
    () =>
      publications.filter((publication) =>
        isEventsPage
          ? publication.type === 'event'
          : publication.type !== 'event',
      ),
    [isEventsPage, publications],
  )

  const filteredPublications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return scopedPublications.filter(
      (publication) =>
        (statusFilter === 'all' || publication.status === statusFilter) &&
        `${publication.title} ${publication.content} ${publication.location || ''}`
          .toLowerCase()
          .includes(normalizedQuery),
    )
  }, [query, scopedPublications, statusFilter])
  const { page, setPage, totalPages, paginatedItems } = usePagination(
    filteredPublications,
    6,
  )

  const stats = {
    total: scopedPublications.length,
    published: scopedPublications.filter(
      (publication) => publication.status === 'published',
    ).length,
    draft: scopedPublications.filter(
      (publication) => publication.status === 'draft',
    ).length,
    archived: scopedPublications.filter(
      (publication) => publication.status === 'archived',
    ).length,
  }
  const statCards: StatCard[] = [
    ['Total', stats.total, FilePenLine, 'blue'],
    ['Publiés', stats.published, Eye, 'green'],
    ['Brouillons', stats.draft, Clock3, 'orange'],
    ['Archivés', stats.archived, Archive, 'gray'],
  ]

  const openCreateForm = () => {
    setEditingPublication(null)
    setError('')
    setFormOpen(true)
  }

  const openEditForm = (publication: Publication) => {
    setEditingPublication(publication)
    setError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    if (isSubmitting) return
    setFormOpen(false)
    setEditingPublication(null)
  }

  const handleSave = async (form: PublicationPayload) => {
    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      if (editingPublication) {
        const updated = await updatePublication(editingPublication._id, form)
        setPublications((current) =>
          current.map((publication) =>
            publication._id === updated._id ? updated : publication,
          ),
        )
        setNotice('La publication a été modifiée.')
      } else {
        const created = await createPublication(form)
        setPublications((current) => [created, ...current])
        setNotice(
          isEventsPage
            ? "L'événement a été créé."
            : 'La publication a été créée.',
        )
      }

      setFormOpen(false)
      setEditingPublication(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!publicationToDelete) return

    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      await deletePublication(publicationToDelete._id)
      setPublications((current) =>
        current.filter(
          (publication) => publication._id !== publicationToDelete._id,
        ),
      )
      setPublicationToDelete(null)
      setNotice('La publication a été supprimée.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="publications-page">
      <div className="publications-page__heading">
        <div>
          <p>{isEventsPage ? 'Agenda associatif' : 'Communication'}</p>
          <h1>{isEventsPage ? 'Événements' : 'Actualités'}</h1>
          <span>
            {isEventsPage
              ? "Planifiez les rendez-vous et activités de l'association."
              : 'Préparez, publiez et archivez les informations du site.'}
          </span>
        </div>
        <button type="button" onClick={openCreateForm}>
          <Plus size={18} />
          {isEventsPage ? 'Ajouter un événement' : 'Ajouter une publication'}
        </button>
      </div>

      {error && (
        <p className="publications-alert publications-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p
          className="publications-alert publications-alert--success"
          role="status"
        >
          {notice}
        </p>
      )}

      <section className="publication-stats">
        {statCards.map(([label, value, Icon, color]) => (
          <article key={label}>
            <span
              className={`publication-stats__icon publication-stats__icon--${color}`}
            >
              <Icon />
            </span>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="publications-panel">
        <div className="publications-toolbar">
          <label className="publications-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher par titre, contenu ou lieu..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <select
            aria-label="Filtrer par statut"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter)
              setPage(1)
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="archived">Archivés</option>
          </select>
        </div>

        <div className="publication-grid">
          {isLoading ? (
            <p className="publications-empty">Chargement des publications...</p>
          ) : filteredPublications.length ? (
            paginatedItems.map((publication) => (
              <article className="publication-card" key={publication._id}>
                <div className="publication-card__image">
                  {publication.image ? (
                    <img src={getAssetUrl(publication.image)} alt="" />
                  ) : (
                    <FilePenLine />
                  )}
                  <span
                    className={`publication-badge publication-badge--${publication.status}`}
                  >
                    {statusLabels[publication.status]}
                  </span>
                </div>
                <div className="publication-card__body">
                  <div className="publication-card__meta">
                    <span>{typeLabels[publication.type]}</span>
                    <time>
                      {publication.publicationDate
                        ? new Date(
                            publication.publicationDate,
                          ).toLocaleDateString('fr-FR')
                        : 'Non renseignée'}
                    </time>
                  </div>
                  <h2>{publication.title}</h2>
                  <p>{publication.content}</p>
                  {publication.type === 'event' && (
                    <div className="publication-card__event">
                      <span>
                        <CalendarDays size={14} />
                        {publication.startDate
                          ? new Date(publication.startDate).toLocaleString(
                              'fr-FR',
                              {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              },
                            )
                          : 'Non renseignée'}
                      </span>
                      {publication.location && (
                        <span>
                          <MapPin size={14} />
                          {publication.location}
                        </span>
                      )}
                    </div>
                  )}
                  <footer>
                    <small>Priorité : {publication.priority || 'normal'}</small>
                    <div>
                      <button
                        type="button"
                        aria-label={`Modifier ${publication.title}`}
                        onClick={() => openEditForm(publication)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="publication-card__delete"
                        aria-label={`Supprimer ${publication.title}`}
                        onClick={() => setPublicationToDelete(publication)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </footer>
                </div>
              </article>
            ))
          ) : (
            <p className="publications-empty">
              Aucun contenu ne correspond aux filtres.
            </p>
          )}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>

      {formOpen && (
        <PublicationFormModal
          publication={editingPublication}
          mode={mode}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSave}
        />
      )}

      {publicationToDelete && (
        <ConfirmDialog
          title="Supprimer cette publication ?"
          message={`« ${publicationToDelete.title} » et son image seront supprimés définitivement.`}
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setPublicationToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  )
}

export default PublicationsPage
