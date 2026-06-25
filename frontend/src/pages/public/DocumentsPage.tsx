import { Download, FileText, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  downloadDocument,
  getPublishedDocuments,
} from '../../services/documentService'
import type { DocumentCategory, DocumentResource } from '../../types/api'
import './DocumentsPage.css'

type CategoryFilter = DocumentCategory | 'all'

const categoryLabels: Record<DocumentCategory, string> = {
  administratif: 'Administratif',
  association: 'Association',
  'compte-rendu': 'Compte rendu',
  formulaire: 'Formulaire',
  other: 'Autre',
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} Ko`
    : `${(bytes / 1024 / 1024).toFixed(1)} Mo`

function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResource[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getPublishedDocuments(controller.signal)
      .then(setDocuments)
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

  const categories = useMemo(
    () => [...new Set(documents.map((item) => item.category))],
    [documents],
  )

  const visibleDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return documents.filter(
      (item) =>
        (category === 'all' || item.category === category) &&
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(normalizedQuery),
    )
  }, [category, documents, query])

  const handleDownload = async (resource: DocumentResource) => {
    setDownloadingId(resource._id)
    setError('')
    try {
      await downloadDocument(resource)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Erreur')
    } finally {
      setDownloadingId('')
    }
  }

  return (
    <main className="public-documents">
      <header>
        <span>Ressources de l'AGA</span>
        <h1>Documents</h1>
        <p>Consultez et téléchargez les documents publiés par l'association.</p>
      </header>

      <section className="public-documents__content">
        <div className="public-documents__toolbar">
          <label>
            <Search size={18} />
            <input
              type="search"
              placeholder="Rechercher un document..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryFilter)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((value) => (
              <option value={value} key={value}>
                {categoryLabels[value] || value}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="public-documents__error">{error}</p>}

        <div className="public-documents__grid">
          {isLoading ? (
            <p className="public-documents__empty">Chargement...</p>
          ) : visibleDocuments.length ? (
            visibleDocuments.map((resource) => (
              <article key={resource._id}>
                <span className="public-document__icon"><FileText /></span>
                <div>
                  <small>{categoryLabels[resource.category] || resource.category}</small>
                  <h2>{resource.title}</h2>
                  <p>{resource.description || 'Document publié par l’AGA.'}</p>
                  <span>
                    {resource.originalName} · {formatSize(resource.size)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={downloadingId === resource._id}
                  onClick={() => handleDownload(resource)}
                >
                  <Download size={17} />
                  {downloadingId === resource._id
                    ? 'Téléchargement...'
                    : 'Télécharger'}
                </button>
              </article>
            ))
          ) : (
            <p className="public-documents__empty">
              Aucun document ne correspond à la recherche.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default DocumentsPage
