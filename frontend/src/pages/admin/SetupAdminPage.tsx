import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/common/Logo'
import {
  bootstrapSuperAdmin,
  getBootstrapStatus,
} from '../../services/bootstrapService'
import './SetupAdminPage.css'

type SetupStatus = 'loading' | 'available' | 'locked' | 'error'

const initialForm = {
  nom: '',
  prenom: '',
  email: '',
  fonction: 'Responsable AGA',
  mot_de_passe: '',
  confirmation: '',
}

type SetupForm = typeof initialForm

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Une erreur inattendue est survenue'

function SetupAdminPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<SetupStatus>('loading')
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getBootstrapStatus()
      .then(({ available }) => setStatus(available ? 'available' : 'locked'))
      .catch((statusError) => {
        setError(getErrorMessage(statusError))
        setStatus('error')
      })
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (form.mot_de_passe !== form.confirmation) {
      setError('Les deux mots de passe ne correspondent pas')
      return
    }

    setIsSubmitting(true)

    try {
      const payload: Omit<SetupForm, 'confirmation'> = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        fonction: form.fonction,
        mot_de_passe: form.mot_de_passe,
      }
      await bootstrapSuperAdmin(payload)
      navigate('/admin/login', {
        replace: true,
        state: {
          setupSuccess:
            'Votre super administrateur est créé. Vous pouvez maintenant vous connecter.',
        },
      })
    } catch (setupError) {
      setError(getErrorMessage(setupError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="setup-page">
      <section className="setup-page__intro">
        <Logo light />
        <div>
          <span>Première installation</span>
          <h1>Créez le compte principal de l&apos;AGA.</h1>
          <p>
            Cette étape n&apos;est disponible que localement et se verrouille
            dès que le premier administrateur est créé.
          </p>
        </div>
        <ul>
          <li>
            <ShieldCheck size={20} />
            Rôle super administrateur
          </li>
          <li>
            <LockKeyhole size={20} />
            Mot de passe hashé par bcrypt
          </li>
          <li>
            <CheckCircle2 size={20} />
            Formulaire désactivé après création
          </li>
        </ul>
      </section>

      <section className="setup-page__content">
        {status === 'loading' && (
          <p className="setup-status">Vérification de l’installation...</p>
        )}

        {status === 'locked' && (
          <div className="setup-locked">
            <ShieldCheck size={40} />
            <h2>Installation déjà terminée</h2>
            <p>
              Un administrateur existe déjà. Cette page ne permet plus de créer
              de compte privilégié.
            </p>
            <Link to="/admin/login">Aller à la connexion</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="setup-locked">
            <h2>Amorçage indisponible</h2>
            <p>{error}</p>
            <Link to="/admin/login">Retour à la connexion</Link>
          </div>
        )}

        {status === 'available' && (
          <form className="setup-form" onSubmit={handleSubmit}>
            <div className="setup-form__heading">
              <span>Compte principal</span>
              <h2>Super administrateur</h2>
              <p>Tous les champs marqués sont nécessaires.</p>
            </div>

            {error && (
              <p className="setup-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="setup-form__row">
              <label>
                Prénom
                <input
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Nom
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              Adresse email
              <input
                autoComplete="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Fonction
              <input
                name="fonction"
                value={form.fonction}
                onChange={handleChange}
              />
            </label>

            <div className="setup-form__row">
              <label>
                Mot de passe
                <span className="setup-form__password">
                  <input
                    autoComplete="new-password"
                    minLength={12}
                    name="mot_de_passe"
                    type={showPassword ? 'text' : 'password'}
                    value={form.mot_de_passe}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? 'Masquer les mots de passe'
                        : 'Afficher les mots de passe'
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              <label>
                Confirmation
                <input
                  autoComplete="new-password"
                  minLength={12}
                  name="confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmation}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <small>
              Utilisez au moins 12 caractères avec majuscules, minuscules,
              chiffres et caractères spéciaux.
            </small>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Création en cours...'
                : 'Créer le super administrateur'}
            </button>

            <Link to="/admin/login">J&apos;ai déjà un compte</Link>
          </form>
        )}
      </section>
    </main>
  )
}

export default SetupAdminPage
