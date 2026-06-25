import {
  Archive,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import DocumentFormModal from '../../components/admin/DocumentFormModal'
import Pagination from '../../components/common/Pagination'
import usePagination from '../../hooks/usePagination'
import {
  createDocument,
  deleteDocument,
  downloadDocument,
  getAdminDocuments,
  updateDocument,
} from '../../services/documentService'
import type {
  ApiError,
  DocumentCategory,
  DocumentPayload,
  DocumentResource,
  PublicationStatus,
} from '../../types/api'
import './DocumentsPage.css'

type StatusFilter = PublicationStatus | 'all'
type CategoryFilter = DocumentCategory | 'all'
type StatCard = [string, number, LucideIcon, string]

const statusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

const categoryLabels: Record<DocumentCategory, string> = {
  administratif: 'Administratif',
  association: 'Association',
  'compte-rendu': 'Compte rendu',
  formulaire: 'Formulaire',
  other: 'Autre',
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : 'Non renseignée'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError
    const data = apiError.data as { errors?: string[] } | undefined
    return data?.errors?.join('. ') || error.message
  }

  return 'Une erreur inattendue est survenue'
}

function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingDocument, setEditingDocument] =
    useState<DocumentResource | null>(null)
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentResource | null>(null)
  const [downloadingId, setDownloadingId] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getAdminDocuments(controller.signal)
      .then(setDocuments)
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return documents.filter(
      (resource) =>
        (statusFilter === 'all' || resource.status === statusFilter) &&
        (categoryFilter === 'all' || resource.category === categoryFilter) &&
        `${resource.title} ${resource.description} ${resource.originalName}`
          .toLowerCase()
          .includes(normalizedQuery),
    )
  }, [categoryFilter, documents, query, statusFilter])
  const { page, setPage, totalPages, paginatedItems } = usePagination(
    filteredDocuments,
    8,
  )

  const stats = {
    total: documents.length,
    published: documents.filter((item) => item.status === 'published').length,
    draft: documents.filter((item) => item.status === 'draft').length,
    archived: documents.filter((item) => item.status === 'archived').length,
  }

  const closeForm = () => {
    if (isSubmitting) return
    setFormOpen(false)
    setEditingDocument(null)
  }

  const handleSave = async (form: DocumentPayload) => {
    setIsSubmitting(true)
    setError('')
    setNotice('')
    try {
      if (editingDocument) {
        const updated = await updateDocument(editingDocument._id, form)
        setDocuments((current) =>
          current.map((item) => (item._id === updated._id ? updated : item)),
        )
        setNotice('Le document a été modifié.')
      } else {
        const created = await createDocument(form)
        setDocuments((current) => [created, ...current])
        setNotice('Le document a été ajouté.')
      }
      setFormOpen(false)
      setEditingDocument(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = async (resource: DocumentResource) => {
    setDownloadingId(resource._id)
    setError('')
    try {
      await downloadDocument(resource, { admin: true })
    } catch (downloadError) {
      setError(getErrorMessage(downloadError))
    } finally {
      setDownloadingId('')
    }
  }

  const handleDelete = async () => {
    if (!documentToDelete) return
    setIsSubmitting(true)
    setError('')
    try {
      await deleteDocument(documentToDelete._id)
      setDocuments((current) =>
        current.filter((item) => item._id !== documentToDelete._id),
      )
      setDocumentToDelete(null)
      setNotice('Le document et son fichier ont été supprimés.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="documents-page">
      <div className="documents-page__heading">
        <div>
          <p>Ressources</p>
          <h1>Documents</h1>
          <span>Publiez et classez les fichiers utiles de l'association.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingDocument(null)
            setFormOpen(true)
          }}
        >
          <Plus size={18} />
          Ajouter un document
        </button>
      </div>

      {error && (
        <p className="documents-alert documents-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="documents-alert documents-alert--success" role="status">
          {notice}
        </p>
      )}

      <section className="document-stats">
        {([
          ['Total', stats.total, FileText, 'blue'],
          ['Publiés', stats.published, Eye, 'green'],
          ['Brouillons', stats.draft, Pencil, 'orange'],
          ['Archivés', stats.archived, Archive, 'gray'],
        ] as StatCard[]).map(([label, value, Icon, color]) => (
          <article key={label}>
            <span className={`document-stats__icon document-stats__icon--${color}`}>
              <Icon />
            </span>
            <div><small>{label}</small><strong>{value}</strong></div>
          </article>
        ))}
      </section>

      <section className="documents-panel">
        <div className="documents-toolbar">
          <label>
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher un titre ou un fichier..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <div>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value as CategoryFilter)
                setPage(1)
              }}
            >
              <option value="all">Toutes les catégories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
            <select
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
        </div>

        <div className="documents-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Catégorie</th>
                <th>Fichier</th>
                <th>Publication</th>
                <th>Statut</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="documents-empty">Chargement...</td></tr>
              ) : filteredDocuments.length ? (
                paginatedItems.map((resource) => (
                  <tr key={resource._id}>
                    <td>
                      <strong>{resource.title}</strong>
                      <small>{resource.description || 'Sans description'}</small>
                    </td>
                    <td>{categoryLabels[resource.category] || resource.category}</td>
                    <td>
                      <span className="document-file-name">{resource.originalName}</span>
                      <small>{formatSize(resource.size)}</small>
                    </td>
                    <td>{formatDate(resource.publicationDate)}</td>
                    <td>
                      <span className={`document-badge document-badge--${resource.status}`}>
                        {statusLabels[resource.status]}
                      </span>
                    </td>
                    <td>
                      <div className="document-actions">
                        <button
                          type="button"
                          aria-label={`Télécharger ${resource.title}`}
                          disabled={downloadingId === resource._id}
                          onClick={() => handleDownload(resource)}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Modifier ${resource.title}`}
                          onClick={() => {
                            setEditingDocument(resource)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer ${resource.title}`}
                          onClick={() => setDocumentToDelete(resource)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="documents-empty">
                    Aucun document ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        <footer>{filteredDocuments.length} document(s) trouvé(s)</footer>
      </section>

      {formOpen && (
        <DocumentFormModal
          resource={editingDocument}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSave}
        />
      )}
      {documentToDelete && (
        <ConfirmDialog
          title="Supprimer ce document ?"
          message={`« ${documentToDelete.title} » et son fichier seront supprimés définitivement.`}
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setDocumentToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  )
}

export default DocumentsPage
