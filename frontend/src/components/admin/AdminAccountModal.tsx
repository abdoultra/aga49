import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Admin } from '../../types/api'
import './AdminAccountModal.css'

type AdminAccountFormValues = Partial<Admin> & {
  nom: string
  prenom: string
  email: string
  telephone: string
  fonction: string
  role: Admin['role']
  actif: boolean
  mot_de_passe?: string
}

interface AdminAccountModalProps {
  account: Admin | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (form: AdminAccountFormValues) => void | Promise<void>
}

function AdminAccountModal({
  account,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminAccountModalProps) {
  const [form, setForm] = useState<AdminAccountFormValues>({
    nom: account?.nom || '',
    prenom: account?.prenom || '',
    email: account?.email || '',
    telephone: account?.telephone || '',
    fonction: account?.fonction || '',
    role: account?.role || 'admin',
    actif: account?.actif ?? true,
    mot_de_passe: '',
  })

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onClose])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target
    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className="modal-backdrop">
      <section className="admin-account-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span>Sécurité</span>
            <h2>{account ? 'Modifier le compte' : 'Créer un administrateur'}</h2>
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
            const payload = { ...form }
            if (account) payload.mot_de_passe = undefined
            onSubmit(payload)
          }}
        >
          <div className="admin-account-form__row">
            <label>Prénom *<input name="prenom" value={form.prenom} onChange={handleChange} required /></label>
            <label>Nom *<input name="nom" value={form.nom} onChange={handleChange} required /></label>
          </div>
          <label>Email *<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
          <div className="admin-account-form__row">
            <label>Téléphone<input name="telephone" value={form.telephone} onChange={handleChange} /></label>
            <label>Fonction<input name="fonction" value={form.fonction} onChange={handleChange} /></label>
          </div>
          <div className="admin-account-form__row">
            {account && (
              <label>
                Rôle
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="admin">Administrateur</option>
                  <option value="super_admin">Super administrateur</option>
                </select>
              </label>
            )}
            {!account && (
              <label>
                Mot de passe *
                <input
                  minLength={8}
                  name="mot_de_passe"
                  type="password"
                  value={form.mot_de_passe}
                  onChange={handleChange}
                  required
                />
              </label>
            )}
          </div>
          {account && (
            <label className="admin-account-form__check">
              <input name="actif" type="checkbox" checked={form.actif} onChange={handleChange} />
              Compte actif
            </label>
          )}
          <footer>
            <button type="button" onClick={onClose}>Annuler</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default AdminAccountModal
