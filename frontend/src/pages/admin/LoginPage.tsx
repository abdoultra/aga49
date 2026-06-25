import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../components/common/Logo'
import useAuth from '../../hooks/useAuth'
import { getBootstrapStatus } from '../../services/bootstrapService'
import type { LoginCredentials } from '../../types/api'
import './LoginPage.css'

interface LoginLocationState {
  from?: string
  setupSuccess?: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Une erreur inattendue est survenue'

function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState<LoginCredentials>({
    email: '',
    mot_de_passe: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setupAvailable, setSetupAvailable] = useState(false)

  const locationState = location.state as LoginLocationState | null
  const destination = locationState?.from || '/admin'

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    getBootstrapStatus()
      .then(({ available }) => setSetupAvailable(available))
      .catch(() => setSetupAvailable(false))
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(getErrorMessage(loginError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__visual">
        <div className="login-page__visual-content">
          <Logo light />
          <p>Administration AGA</p>
          <h1>Gérez la vie de l&apos;association depuis un espace sécurisé.</h1>
          <span>
            Membres, cotisations, actualités, événements, galerie et documents.
          </span>
        </div>
      </section>

      <section className="login-page__form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__heading">
            <p>Bienvenue</p>
            <h2>Connexion au dashboard</h2>
            <span>Utilisez votre compte administrateur AGA.</span>
          </div>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}
          {locationState?.setupSuccess && (
            <p className="login-form__success" role="status">
              {locationState.setupSuccess}
            </p>
          )}

          <label>
            Adresse email
            <span className="login-form__field">
              <Mail size={18} />
              <input
                autoComplete="email"
                name="email"
                placeholder="admin@aga-angers.fr"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </span>
          </label>

          <label>
            Mot de passe
            <span className="login-form__field">
              <LockKeyhole size={18} />
              <input
                autoComplete="current-password"
                minLength={8}
                name="mot_de_passe"
                placeholder="Votre mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={form.mot_de_passe}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <button
            className="login-form__submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          <Link to="/">Retour au site public</Link>
          {setupAvailable && (
            <Link className="login-form__setup-link" to="/admin/setup">
              Créer le premier super administrateur
            </Link>
          )}
        </form>
      </section>
    </main>
  )
}

export default LoginPage
