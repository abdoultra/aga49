import {
  CheckCheck,
  Clock3,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import {
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from '../../services/contactMessageService'
import type {
  ApiError,
  ContactMessage,
  ContactMessageStatus,
} from '../../types/api'
import './MessagesPage.css'

type StatusFilter = ContactMessageStatus | 'all'
type StatCard = [string, number, LucideIcon, string]

const statusLabels: Record<ContactMessageStatus, string> = {
  unread: 'Non lu',
  read: 'Lu',
  processed: 'Traité',
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError
    const data = apiError.data as { errors?: string[] } | undefined
    return data?.errors?.join('. ') || error.message
  }

  return 'Une erreur inattendue est survenue'
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : ''

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : ''

function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [messageToDelete, setMessageToDelete] =
    useState<ContactMessage | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getContactMessages(controller.signal)
      .then((items) => {
        setMessages(items)
        setSelectedId(items[0]?._id || '')
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return messages.filter(
      (item) =>
        (statusFilter === 'all' || item.statut === statusFilter) &&
        `${item.nom} ${item.prenom} ${item.email} ${item.sujet} ${item.message}`
          .toLowerCase()
          .includes(normalizedQuery),
    )
  }, [messages, query, statusFilter])

  const selectedMessage = messages.find((item) => item._id === selectedId)

  const selectMessage = async (item: ContactMessage) => {
    setSelectedId(item._id)
    setError('')

    if (item.statut !== 'unread') return

    try {
      const updated = await updateContactMessageStatus(item._id, 'read')
      setMessages((current) =>
        current.map((message) =>
          message._id === updated._id ? updated : message,
        ),
      )
    } catch (statusError) {
      setError(getErrorMessage(statusError))
    }
  }

  const setStatus = async (statut: ContactMessageStatus) => {
    if (!selectedMessage) return
    setIsSubmitting(true)
    setError('')
    try {
      const updated = await updateContactMessageStatus(
        selectedMessage._id,
        statut,
      )
      setMessages((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      )
      setNotice(`Le message est maintenant « ${statusLabels[statut]} ».`)
    } catch (statusError) {
      setError(getErrorMessage(statusError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!messageToDelete) return
    setIsSubmitting(true)
    setError('')
    try {
      await deleteContactMessage(messageToDelete._id)
      const remaining = messages.filter(
        (item) => item._id !== messageToDelete._id,
      )
      setMessages(remaining)
      if (selectedId === messageToDelete._id) {
        setSelectedId(remaining[0]?._id || '')
      }
      setMessageToDelete(null)
      setNotice('Le message a été supprimé.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const stats = {
    total: messages.length,
    unread: messages.filter((item) => item.statut === 'unread').length,
    read: messages.filter((item) => item.statut === 'read').length,
    processed: messages.filter((item) => item.statut === 'processed').length,
  }
  const statCards: StatCard[] = [
    ['Total', stats.total, Mail, 'blue'],
    ['Non lus', stats.unread, Clock3, 'red'],
    ['Lus', stats.read, MailOpen, 'orange'],
    ['Traités', stats.processed, CheckCheck, 'green'],
  ]

  return (
    <main className="messages-page">
      <div className="messages-page__heading">
        <div>
          <p>Communication</p>
          <h1>Messages</h1>
          <span>Consultez les demandes envoyées depuis le site public.</span>
        </div>
      </div>

      {error && (
        <p className="messages-alert messages-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="messages-alert messages-alert--success" role="status">
          {notice}
        </p>
      )}

      <section className="message-stats">
        {statCards.map(([label, value, Icon, color]) => (
          <article key={label}>
            <span className={`message-stats__icon message-stats__icon--${color}`}>
              <Icon />
            </span>
            <div><small>{label}</small><strong>{value}</strong></div>
          </article>
        ))}
      </section>

      <section className="messages-inbox">
        <aside>
          <div className="messages-toolbar">
            <label>
              <Search size={16} />
              <input
                type="search"
                placeholder="Rechercher..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">Tous</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
              <option value="processed">Traités</option>
            </select>
          </div>

          <div className="message-list">
            {isLoading ? (
              <p className="messages-empty">Chargement...</p>
            ) : filteredMessages.length ? (
              filteredMessages.map((item) => (
                <button
                  type="button"
                  className={`${item._id === selectedId ? 'is-selected' : ''} ${
                    item.statut === 'unread' ? 'is-unread' : ''
                  }`}
                  key={item._id}
                  onClick={() => selectMessage(item)}
                >
                  <span className="message-list__avatar">
                    {item.prenom[0]}{item.nom[0]}
                  </span>
                  <span className="message-list__copy">
                    <strong>{item.prenom} {item.nom}</strong>
                    <b>{item.sujet}</b>
                    <small>{item.message}</small>
                  </span>
                  <time>
                    {formatDate(item.dateEnvoi)}
                  </time>
                </button>
              ))
            ) : (
              <p className="messages-empty">Aucun message.</p>
            )}
          </div>
        </aside>

        <article className="message-detail">
          {selectedMessage ? (
            <>
              <header>
                <div>
                  <span className={`message-badge message-badge--${selectedMessage.statut}`}>
                    {statusLabels[selectedMessage.statut]}
                  </span>
                  <h2>{selectedMessage.sujet}</h2>
                </div>
                <button
                  type="button"
                  aria-label="Supprimer ce message"
                  onClick={() => setMessageToDelete(selectedMessage)}
                >
                  <Trash2 size={17} />
                </button>
              </header>
              <div className="message-sender">
                <span>{selectedMessage.prenom[0]}{selectedMessage.nom[0]}</span>
                <div>
                  <strong>{selectedMessage.prenom} {selectedMessage.nom}</strong>
                  <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                  {selectedMessage.telephone && (
                    <a href={`tel:${selectedMessage.telephone}`}>
                      {selectedMessage.telephone}
                    </a>
                  )}
                </div>
                <time>
                  {formatDateTime(selectedMessage.dateEnvoi)}
                </time>
              </div>
              <p className="message-detail__content">{selectedMessage.message}</p>
              <footer>
                <button
                  type="button"
                  disabled={isSubmitting || selectedMessage.statut === 'unread'}
                  onClick={() => setStatus('unread')}
                >
                  Marquer non lu
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || selectedMessage.statut === 'processed'}
                  onClick={() => setStatus('processed')}
                >
                  <CheckCheck size={16} /> Marquer comme traité
                </button>
              </footer>
            </>
          ) : (
            <p className="messages-empty">Sélectionnez un message.</p>
          )}
        </article>
      </section>

      {messageToDelete && (
        <ConfirmDialog
          title="Supprimer ce message ?"
          message={`Le message de ${messageToDelete.prenom} ${messageToDelete.nom} sera supprimé définitivement.`}
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setMessageToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  )
}

export default MessagesPage
