import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import MemberFormModal from '../../components/admin/MemberFormModal'
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from '../../services/memberService'
import type { Member, MemberPayload, MemberStatus } from '../../types/api'
import './MembersPage.css'

const PAGE_SIZE = 8
type StatusFilter = MemberStatus | 'tous'
type StatCard = [string, number, LucideIcon, string]

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Une erreur inattendue est survenue'

function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('tous')
  const [page, setPage] = useState(1)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getMembers(controller.signal)
      .then(setMembers)
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return members.filter((member) => {
      const matchesStatus =
        statusFilter === 'tous' || member.statut === statusFilter
      const searchable = [
        member.nom,
        member.prenom,
        member.email,
        member.telephone,
        member.ville,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesStatus && searchable.includes(normalizedQuery)
    })
  }, [members, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleMembers = filteredMembers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const stats = {
    total: members.length,
    active: members.filter((member) => member.statut === 'actif').length,
    inactive: members.filter((member) => member.statut === 'inactif').length,
  }
  const statCards: StatCard[] = [
    ['Total des membres', stats.total, Users, 'blue'],
    ['Membres actifs', stats.active, UserCheck, 'green'],
    ['Membres inactifs', stats.inactive, UserX, 'orange'],
  ]

  const openCreateForm = () => {
    setEditingMember(null)
    setError('')
    setFormOpen(true)
  }

  const openEditForm = (member: Member) => {
    setEditingMember(member)
    setError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    if (isSubmitting) return
    setFormOpen(false)
    setEditingMember(null)
  }

  const handleSave = async (form: MemberPayload) => {
    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      if (editingMember) {
        const updated = await updateMember(editingMember._id, form)
        setMembers((current) =>
          current.map((member) =>
            member._id === updated._id ? updated : member,
          ),
        )
        setNotice('Le membre a été modifié avec succès.')
      } else {
        const created = await createMember(form)
        setMembers((current) => [created, ...current])
        setNotice('Le membre a été ajouté avec succès.')
      }

      setFormOpen(false)
      setEditingMember(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!memberToDelete) return

    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      await deleteMember(memberToDelete._id)
      setMembers((current) =>
        current.filter((member) => member._id !== memberToDelete._id),
      )
      setMemberToDelete(null)
      setNotice('Le membre a été supprimé.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="members-page">
      <div className="members-page__heading">
        <div>
          <p>Gestion associative</p>
          <h1>Membres</h1>
          <span>Ajoutez et tenez à jour les adhérents de l&apos;AGA.</span>
        </div>
        <button type="button" onClick={openCreateForm}>
          <Plus size={18} />
          Ajouter un membre
        </button>
      </div>

      {error && (
        <p className="members-alert members-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="members-alert members-alert--success" role="status">
          {notice}
        </p>
      )}

      <section className="member-stats" aria-label="Statistiques des membres">
        {statCards.map(([label, value, Icon, color]) => (
          <article key={label}>
            <span className={`member-stats__icon member-stats__icon--${color}`}>
              <Icon />
            </span>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="members-panel">
        <div className="members-toolbar">
          <label className="members-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher par nom, email, téléphone..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <label className="members-filter">
            Statut
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter)
                setPage(1)
              }}
            >
              <option value="tous">Tous</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </label>
        </div>

        <div className="members-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Membre</th>
                <th>Coordonnées</th>
                <th>Ville</th>
                <th>Adhésion</th>
                <th>Statut</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="members-empty">
                    Chargement des membres...
                  </td>
                </tr>
              ) : visibleMembers.length ? (
                visibleMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="member-identity">
                        <span>
                          {member.prenom?.[0]}
                          {member.nom?.[0]}
                        </span>
                        <div>
                          <strong>
                            {member.prenom} {member.nom}
                          </strong>
                          <small>{member.email || 'Email non renseigné'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="member-contact">
                        {member.telephone || 'Téléphone non renseigné'}
                      </span>
                    </td>
                    <td>{member.ville || 'Non renseignée'}</td>
                    <td>
                      {member.date_adhesion
                        ? new Date(member.date_adhesion).toLocaleDateString(
                            'fr-FR',
                          )
                        : 'Non renseignée'}
                    </td>
                    <td>
                      <span
                        className={`member-badge member-badge--${member.statut}`}
                      >
                        {member.statut}
                      </span>
                    </td>
                    <td>
                      <div className="member-actions">
                        <button
                          type="button"
                          aria-label={`Modifier ${member.prenom} ${member.nom}`}
                          onClick={() => openEditForm(member)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="member-actions__delete"
                          aria-label={`Supprimer ${member.prenom} ${member.nom}`}
                          onClick={() => setMemberToDelete(member)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="members-empty">
                    Aucun membre ne correspond à la recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="members-pagination">
          <span>
            {filteredMembers.length} résultat
            {filteredMembers.length > 1 ? 's' : ''}
          </span>
          <div>
            <button
              type="button"
              aria-label="Page précédente"
              disabled={safePage === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Page {safePage} sur {totalPages}
            </span>
            <button
              type="button"
              aria-label="Page suivante"
              disabled={safePage === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      </section>

      {formOpen && (
        <MemberFormModal
          member={editingMember}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSave}
        />
      )}

      {memberToDelete && (
        <ConfirmDialog
          title="Supprimer ce membre ?"
          message={`${memberToDelete.prenom} ${memberToDelete.nom} sera retiré de la liste. Cette action est définitive.`}
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setMemberToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  )
}

export default MembersPage
