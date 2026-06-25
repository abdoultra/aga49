import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type {
  EntityId,
  Member,
  MembershipFee,
  MembershipFeePayload,
  PaymentMethod,
  PaymentStatus,
} from '../../types/api'
import './MembershipFeeFormModal.css'

const currentYear = new Date().getFullYear()

interface FeeFormValues {
  member: EntityId | ''
  year: string
  amount: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentDate: string
  reference: string
  note: string
}

interface MembershipFeeFormModalProps {
  fee: MembershipFee | null
  members: Member[]
  onClose: () => void
  onSubmit: (form: MembershipFeePayload) => void | Promise<void>
  isSubmitting: boolean
}

const getMemberId = (member: MembershipFee['member']): EntityId | '' =>
  typeof member === 'string' ? member : member?._id || ''

const emptyFee: FeeFormValues = {
  member: '',
  year: String(currentYear),
  amount: '',
  paymentMethod: 'cash',
  paymentStatus: 'paid',
  paymentDate: new Date().toISOString().slice(0, 10),
  reference: '',
  note: '',
}

const toFormFee = (fee: MembershipFee | null): FeeFormValues =>
  fee
    ? {
        member: getMemberId(fee.member),
        year: String(fee.year),
        amount: String(fee.amount),
        paymentMethod: fee.paymentMethod || 'cash',
        paymentStatus: fee.paymentStatus || 'paid',
        paymentDate: fee.paymentDate
          ? new Date(fee.paymentDate).toISOString().slice(0, 10)
          : '',
        reference: fee.reference || '',
        note: fee.note || '',
      }
    : emptyFee

function MembershipFeeFormModal({
  fee,
  members,
  onClose,
  onSubmit,
  isSubmitting,
}: MembershipFeeFormModalProps) {
  const [form, setForm] = useState(() => toFormFee(fee))

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onClose])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      ...form,
      year: Number(form.year),
      amount: Number(form.amount),
    })
  }

  return (
    <div className="modal-backdrop">
      <section
        className="fee-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fee-modal-title"
      >
        <header>
          <div>
            <span>{fee ? 'Modification' : 'Nouvelle cotisation'}</span>
            <h2 id="fee-modal-title">
              {fee ? 'Modifier la cotisation' : 'Enregistrer une cotisation'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fermer le formulaire"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <label>
            Membre *
            <select
              autoFocus
              name="member"
              value={form.member}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un membre</option>
              {members.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.prenom} {member.nom}
                  {member.statut === 'inactif' ? ' (inactif)' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="fee-form__row">
            <label>
              Année *
              <input
                max="2100"
                min="2000"
                name="year"
                type="number"
                value={form.year}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Montant (€) *
              <input
                min="0"
                name="amount"
                step="0.01"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="fee-form__row">
            <label>
              Statut du paiement
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
              >
                <option value="paid">Payée</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulée</option>
              </select>
            </label>
            <label>
              Moyen de paiement
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="transfer">Virement</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="other">Autre</option>
              </select>
            </label>
          </div>

          <div className="fee-form__row">
            <label>
              Date du paiement
              <input
                name="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={handleChange}
              />
            </label>
            <label>
              Référence
              <input
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="Virement, reçu..."
              />
            </label>
          </div>

          <label>
            Note interne
            <textarea
              name="note"
              rows={4}
              value={form.note}
              onChange={handleChange}
            />
          </label>

          <footer>
            <button
              type="button"
              className="fee-form__cancel"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="fee-form__submit"
              disabled={isSubmitting || members.length === 0}
            >
              {isSubmitting
                ? 'Enregistrement...'
                : fee
                  ? 'Enregistrer les modifications'
                  : 'Enregistrer la cotisation'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default MembershipFeeFormModal
