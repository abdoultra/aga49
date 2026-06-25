import {
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import AdminAccountModal from '../../components/admin/AdminAccountModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import useAuth from '../../hooks/useAuth'
import {
  changeOwnPassword,
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  resetAdminPassword,
  updateAdminAccount,
  updateOwnProfile,
} from '../../services/adminAccountService'
import type { Admin } from '../../types/api'
import './SettingsPage.css'

type AdminAccountForm = Partial<Admin> & {
  mot_de_passe?: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Une erreur inattendue est survenue'

function SettingsPage() {
  const { admin, updateAdmin } = useAuth()
  const isSuperAdmin = admin?.role === 'super_admin'
  const [profile, setProfile] = useState({
    nom: admin?.nom || '',
    prenom: admin?.prenom || '',
    email: admin?.email || '',
    telephone: admin?.telephone || '',
    fonction: admin?.fonction || '',
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmation: '',
  })
  const [accounts, setAccounts] = useState<Admin[]>([])
  const [editingAccount, setEditingAccount] = useState<Admin | null>(null)
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Admin | null>(null)
  const [resetTarget, setResetTarget] = useState<Admin | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refreshAccounts = async () => {
    const items = await getAdminAccounts()
    setAccounts(items)
  }

  useEffect(() => {
    if (!isSuperAdmin) return undefined
    const controller = new AbortController()
    getAdminAccounts(controller.signal)
      .then(setAccounts)
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError))
      })
    return () => controller.abort()
  }, [isSuperAdmin])

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setNotice('')
    try {
      const updated = await updateOwnProfile(profile)
      updateAdmin(updated)
      setNotice('Votre profil a été mis à jour.')
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (passwords.newPassword !== passwords.confirmation) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }
    setIsSubmitting(true)
    try {
      const data = await changeOwnPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmation: '' })
      setNotice(data.message)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAccountSave = async (form: AdminAccountForm) => {
    setIsSubmitting(true)
    setError('')
    try {
      if (editingAccount) {
        await updateAdminAccount(editingAccount._id, form)
        setNotice('Le compte administrateur a été modifié.')
      } else {
        await createAdminAccount(form)
        setNotice('Le compte administrateur a été créé.')
      }
      await refreshAccounts()
      setAccountFormOpen(false)
      setEditingAccount(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resetTarget) return
    setIsSubmitting(true)
    setError('')
    try {
      const data = await resetAdminPassword(resetTarget._id, resetPassword)
      setResetTarget(null)
      setResetPassword('')
      setNotice(data.message)
    } catch (resetError) {
      setError(getErrorMessage(resetError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!accountToDelete) return
    setIsSubmitting(true)
    setError('')
    try {
      await deleteAdminAccount(accountToDelete._id)
      await refreshAccounts()
      setAccountToDelete(null)
      setNotice('Le compte administrateur a été supprimé.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="settings-page">
      <div className="settings-page__heading">
        <div>
          <p>Configuration</p>
          <h1>Paramètres</h1>
          <span>Gérez votre profil et la sécurité de l'administration.</span>
        </div>
      </div>

      {error && (
        <p className="settings-alert settings-alert--error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="settings-alert settings-alert--success" role="status">
          {notice}
        </p>
      )}

      <section className="settings-columns">
        <form className="settings-card" onSubmit={handleProfileSubmit}>
          <header><UserCheck /><div><h2>Mon profil</h2><p>Informations affichées dans le dashboard.</p></div></header>
          <div className="settings-form__row">
            <label>Prénom<input value={profile.prenom} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })} required /></label>
            <label>Nom<input value={profile.nom} onChange={(e) => setProfile({ ...profile, nom: e.target.value })} required /></label>
          </div>
          <label>Email<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required /></label>
          <div className="settings-form__row">
            <label>Téléphone<input value={profile.telephone} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} /></label>
            <label>Fonction<input value={profile.fonction} onChange={(e) => setProfile({ ...profile, fonction: e.target.value })} /></label>
          </div>
          <button type="submit" disabled={isSubmitting}>Enregistrer le profil</button>
        </form>

        <form className="settings-card" onSubmit={handlePasswordSubmit}>
          <header><KeyRound /><div><h2>Mot de passe</h2><p>Le mot de passe actuel est vérifié avant modification.</p></div></header>
          <label>Mot de passe actuel<input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></label>
          <label>Nouveau mot de passe<input minLength={8} type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></label>
          <label>Confirmation<input minLength={8} type="password" value={passwords.confirmation} onChange={(e) => setPasswords({ ...passwords, confirmation: e.target.value })} required /></label>
          <button type="submit" disabled={isSubmitting}>Changer le mot de passe</button>
        </form>
      </section>

      {isSuperAdmin && (
        <section className="admin-accounts-panel">
          <header>
            <div><p>Accès au dashboard</p><h2>Comptes administrateurs</h2></div>
            <button type="button" onClick={() => { setEditingAccount(null); setAccountFormOpen(true) }}><Plus size={17} /> Ajouter un compte</button>
          </header>
          <div className="admin-accounts-grid">
            {accounts.map((account) => (
              <article key={account._id}>
                <span className="admin-account-avatar">{account.prenom?.[0]}{account.nom?.[0]}</span>
                <div>
                  <strong>{account.prenom} {account.nom}</strong>
                  <small>{account.email}</small>
                  <span>{account.fonction || 'Fonction non renseignée'}</span>
                </div>
                <span className={`admin-account-status ${account.actif ? 'is-active' : 'is-inactive'}`}>
                  {account.actif ? <UserCheck size={14} /> : <UserX size={14} />}
                  {account.actif ? 'Actif' : 'Inactif'}
                </span>
                <b><ShieldCheck size={14} /> {account.role === 'super_admin' ? 'Super admin' : 'Admin'}</b>
                <footer>
                  <button type="button" title="Réinitialiser le mot de passe" onClick={() => setResetTarget(account)}><KeyRound size={15} /></button>
                  <button type="button" title="Modifier" onClick={() => { setEditingAccount(account); setAccountFormOpen(true) }}><Pencil size={15} /></button>
                  <button type="button" title="Supprimer" disabled={account._id === admin?.id || account._id === admin?._id} onClick={() => setAccountToDelete(account)}><Trash2 size={15} /></button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}

      {!isSuperAdmin && (
        <section className="settings-permission">
          <ShieldCheck /><div><h2>Gestion des comptes</h2><p>Seul un super administrateur peut créer ou modifier d'autres comptes.</p></div>
        </section>
      )}

      {accountFormOpen && (
        <AdminAccountModal account={editingAccount} isSubmitting={isSubmitting} onClose={() => setAccountFormOpen(false)} onSubmit={handleAccountSave} />
      )}
      {resetTarget && (
        <div className="modal-backdrop">
          <form className="password-reset-dialog" onSubmit={handleResetPassword}>
            <KeyRound /><h2>Réinitialiser le mot de passe</h2>
            <p>{resetTarget.prenom} {resetTarget.nom}</p>
            <input autoFocus minLength={8} type="password" placeholder="Nouveau mot de passe" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required />
            <div><button type="button" onClick={() => setResetTarget(null)}>Annuler</button><button type="submit">Réinitialiser</button></div>
          </form>
        </div>
      )}
      {accountToDelete && (
        <ConfirmDialog title="Supprimer ce compte ?" message={`Le compte de ${accountToDelete.prenom} ${accountToDelete.nom} sera supprimé définitivement.`} confirmLabel="Supprimer" isSubmitting={isSubmitting} onCancel={() => setAccountToDelete(null)} onConfirm={handleDelete} />
      )}
    </main>
  )
}

export default SettingsPage
