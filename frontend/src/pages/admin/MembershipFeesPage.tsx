import {
  Banknote,
  CircleCheck,
  CircleX,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import MembershipFeeFormModal from '../../components/admin/MembershipFeeFormModal'
import {
  createMembershipFee,
  deleteMembershipFee,
  getMembershipFees,
  updateMembershipFee,
} from '../../services/membershipFeeService'
import { getMembers } from '../../services/memberService'
import type {
  ApiError,
  Member,
  MembershipFee,
  MembershipFeePayload,
  PaymentMethod,
  PaymentStatus,
} from '../../types/api'
import './MembershipFeesPage.css'

type YearFilter = string | 'toutes'
type StatusFilter = PaymentStatus | 'tous'
type StatCard = [string, string | number, LucideIcon, string]

const statusLabels: Record<PaymentStatus, string> = {
  paid: 'Payée',
  pending: 'En attente',
  cancelled: 'Annulée',
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  card: 'Carte',
  transfer: 'Virement',
  mobile_money: 'Mobile Money',
  other: 'Autre',
}

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError
    const data = apiError.data as { errors?: string[] } | undefined
    return data?.errors?.join('. ') || error.message
  }

  return 'Une erreur inattendue est survenue'
}

const getFeeMember = (fee: MembershipFee): Member | null =>
  typeof fee.member === 'string' ? null : fee.member

const getFeeMemberName = (fee: MembershipFee) => {
  const member = getFeeMember(fee)
  return member ? `${member.prenom} ${member.nom}` : 'Membre supprimé'
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : 'Non renseignée'

function MembershipFeesPage() {
  const [fees, setFees] = useState<MembershipFee[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState<YearFilter>('toutes')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('tous')
  const [formOpen, setFormOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<MembershipFee | null>(null)
  const [feeToDelete, setFeeToDelete] = useState<MembershipFee | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getMembershipFees(controller.signal),
      getMembers(controller.signal),
    ])
      .then(([feeList, memberList]) => {
        setFees(feeList)
        setMembers(memberList)
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const years = useMemo(
    () => [...new Set(fees.map((fee) => fee.year))].sort((a, b) => b - a),
    [fees],
  )

  const filteredFees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return fees.filter((fee) => {
      const member = getFeeMember(fee)
      const memberName = member
        ? `${member.prenom} ${member.nom} ${member.email || ''}`
        : ''

      return (
        (yearFilter === 'toutes' || String(fee.year) === yearFilter) &&
        (statusFilter === 'tous' || fee.paymentStatus === statusFilter) &&
        `${memberName} ${fee.reference || ''}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    })
  }, [fees, query, statusFilter, yearFilter])

  const stats = {
    paid: fees
      .filter((fee) => fee.paymentStatus === 'paid')
      .reduce((sum, fee) => sum + fee.amount, 0),
    pending: fees
      .filter((fee) => fee.paymentStatus === 'pending')
      .reduce((sum, fee) => sum + fee.amount, 0),
    cancelled: fees.filter((fee) => fee.paymentStatus === 'cancelled').length,
    count: fees.length,
  }

  const openCreateForm = () => {
    setEditingFee(null)
    setError('')
    setFormOpen(true)
  }
  const openEditForm = (fee: MembershipFee) => {
    setEditingFee(fee)
    setError('')
    setFormOpen(true)
  }

  const handleSave = async (form: MembershipFeePayload) => {
    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      if (editingFee) {
        const updated = await updateMembershipFee(editingFee._id, form)
        setFees((current) =>
          current.map((fee) => (fee._id === updated._id ? updated : fee)),
        )
        setNotice('La cotisation a été modifiée.')
      } else {
        const created = await createMembershipFee(form)
        setFees((current) => [created, ...current])
        setNotice('La cotisation a été enregistrée.')
      }

      setFormOpen(false)
      setEditingFee(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!feeToDelete) return

    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      await deleteMembershipFee(feeToDelete._id)
      setFees((current) =>
        current.filter((fee) => fee._id !== feeToDelete._id),
      )
      setFeeToDelete(null)
      setNotice('La cotisation a été supprimée.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="fees-page">
      <div className="fees-page__heading">
        <div>
          <p>Suivi financier</p>
          <h1>Cotisations</h1>
          <span>Enregistrez et suivez les paiements annuels des membres.</span>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          disabled={members.length === 0}
          title={
            members.length === 0
              ? 'Ajoutez d’abord un membre'
              : 'Ajouter une cotisation'
          }
        >
          <Plus size={18} />
          Enregistrer une cotisation
        </button>
      </div>

      {members.length === 0 && !isLoading && (
        <p className="fees-alert fees-alert--info">
          Ajoutez au moins un membre avant d&apos;enregistrer une cotisation.
        </p>
      )}
      {error && (
        <p className="fees-alert fees-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="fees-alert fees-alert--success" role="status">
          {notice}
        </p>
      )}

      <section className="fee-stats" aria-label="Statistiques des cotisations">
        {([
          ['Montant encaissé', currency.format(stats.paid), CircleCheck, 'green'],
          ['Montant en attente', currency.format(stats.pending), Clock3, 'orange'],
          ['Paiements annulés', stats.cancelled, CircleX, 'red'],
          ['Cotisations enregistrées', stats.count, Banknote, 'blue'],
        ] as StatCard[]).map(([label, value, Icon, color]) => (
          <article key={label}>
            <span className={`fee-stats__icon fee-stats__icon--${color}`}>
              <Icon />
            </span>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="fees-panel">
        <div className="fees-toolbar">
          <label className="fees-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher un membre ou une référence..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div>
            <select
              aria-label="Filtrer par année"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value as YearFilter)}
            >
              <option value="toutes">Toutes les années</option>
              {years.map((year) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrer par statut"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="tous">Tous les statuts</option>
              <option value="paid">Payées</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>

        <div className="fees-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Membre</th>
                <th>Année</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Date</th>
                <th>Statut</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="fees-empty">
                    Chargement des cotisations...
                  </td>
                </tr>
              ) : filteredFees.length ? (
                filteredFees.map((fee) => (
                  <tr key={fee._id}>
                    <td>
                      <strong>
                        {fee.member
                          ? getFeeMemberName(fee)
                          : 'Membre supprimé'}
                      </strong>
                      <small>{fee.reference || 'Sans référence'}</small>
                    </td>
                    <td>{fee.year}</td>
                    <td className="fees-amount">{currency.format(fee.amount)}</td>
                    <td>{methodLabels[fee.paymentMethod]}</td>
                    <td>
                      {formatDate(fee.paymentDate)}
                    </td>
                    <td>
                      <span
                        className={`fee-badge fee-badge--${fee.paymentStatus}`}
                      >
                        {statusLabels[fee.paymentStatus]}
                      </span>
                    </td>
                    <td>
                      <div className="fee-actions">
                        <button
                          type="button"
                          aria-label={`Modifier la cotisation de ${getFeeMemberName(fee)}`}
                          onClick={() => openEditForm(fee)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="fee-actions__delete"
                          aria-label={`Supprimer la cotisation de ${getFeeMemberName(fee)}`}
                          onClick={() => setFeeToDelete(fee)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="fees-empty">
                    Aucune cotisation ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer>{filteredFees.length} cotisation(s) affichée(s)</footer>
      </section>

      {formOpen && (
        <MembershipFeeFormModal
          fee={editingFee}
          members={members}
          isSubmitting={isSubmitting}
          onClose={() => {
            if (!isSubmitting) {
              setFormOpen(false)
              setEditingFee(null)
            }
          }}
          onSubmit={handleSave}
        />
      )}

      {feeToDelete && (
        <ConfirmDialog
          title="Supprimer cette cotisation ?"
          message={`La cotisation ${feeToDelete.year} de ${getFeeMemberName(feeToDelete)} sera supprimée définitivement.`}
          confirmLabel="Supprimer"
          isSubmitting={isSubmitting}
          onCancel={() => setFeeToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  )
}

export default MembershipFeesPage
