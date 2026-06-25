import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Member, MemberPayload } from '../../types/api'
import './MemberFormModal.css'

type MemberFormValues = MemberPayload

interface MemberFormModalProps {
  member: Member | null
  onClose: () => void
  onSubmit: (form: MemberFormValues) => void | Promise<void>
  isSubmitting: boolean
}

const emptyMember: MemberFormValues = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  ville: 'Angers',
  statut: 'actif',
  date_adhesion: new Date().toISOString().slice(0, 10),
  note: '',
}

const toFormMember = (member: Member | null): MemberFormValues =>
  member
    ? {
        nom: member.nom || '',
        prenom: member.prenom || '',
        email: member.email || '',
        telephone: member.telephone || '',
        adresse: member.adresse || '',
        ville: member.ville || '',
        statut: member.statut || 'actif',
        date_adhesion: member.date_adhesion
          ? new Date(member.date_adhesion).toISOString().slice(0, 10)
          : '',
        note: member.note || '',
      }
    : emptyMember

function MemberFormModal({
  member,
  onClose,
  onSubmit,
  isSubmitting,
}: MemberFormModalProps) {
  const [form, setForm] = useState(() => toFormMember(member))

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

  return (
    <div className="modal-backdrop">
      <section
        className="member-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
      >
        <header>
          <div>
            <span>{member ? 'Modification' : 'Nouveau membre'}</span>
            <h2 id="member-modal-title">
              {member ? `${member.prenom} ${member.nom}` : 'Ajouter un membre'}
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

        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            onSubmit(form)
          }}
        >
          <div className="member-form__row">
            <label>
              Prénom *
              <input
                autoFocus
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Nom *
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="member-form__row">
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>
            <label>
              Téléphone
              <input
                name="telephone"
                type="tel"
                value={form.telephone}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="member-form__row">
            <label>
              Ville
              <input
                name="ville"
                value={form.ville}
                onChange={handleChange}
              />
            </label>
            <label>
              Adresse
              <input
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="member-form__row">
            <label>
              Date d&apos;adhésion
              <input
                name="date_adhesion"
                type="date"
                value={form.date_adhesion}
                onChange={handleChange}
              />
            </label>
            <label>
              Statut
              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </label>
          </div>

          <label>
            Note interne
            <textarea
              name="note"
              rows={4}
              value={form.note}
              onChange={handleChange}
              placeholder="Informations utiles pour l'équipe..."
            />
          </label>

          <footer>
            <button
              type="button"
              className="member-form__cancel"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="member-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Enregistrement...'
                : member
                  ? 'Enregistrer les modifications'
                  : 'Ajouter le membre'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default MemberFormModal
