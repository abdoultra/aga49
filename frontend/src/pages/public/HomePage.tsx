import {
  ArrowRight,
  CalendarDays,
  Clock3,
  HandHeart,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../../assets/aga-hero.webp'
import angersImage from '../../assets/angers-river.webp'
import SectionHeading from '../../components/common/SectionHeading'
import useHomeData from '../../hooks/useHomeData'
import { sendContactMessage } from '../../services/contactMessageService'
import type {
  Admin,
  Album,
  ApiError,
  Publication,
  PublicationType,
} from '../../types/api'
import { getAssetUrl } from '../../utils/assetUrl'
import { formatLongDate, formatShortDate } from '../../utils/date'
import './HomePage.css'

const values = [
  {
    icon: Users,
    title: 'Unité',
    text: 'Nous restons unis pour avancer ensemble.',
  },
  {
    icon: Landmark,
    title: 'Culture',
    text: 'Nous valorisons notre richesse culturelle.',
  },
  {
    icon: HandHeart,
    title: 'Solidarité',
    text: 'Nous nous soutenons mutuellement.',
  },
  {
    icon: Sparkles,
    title: 'Engagement',
    text: 'Nous agissons pour le bien de la communauté.',
  },
]

type HomeData = {
  publications: Publication[]
  events: Publication[]
  albums: Album[]
  boardMembers: Admin[]
  apiStatus: 'loading' | 'online' | 'offline'
}

const typeLabels: Record<PublicationType, string> = {
  news: 'Actualité',
  announcement: 'Annonce',
  event: 'Événement',
}

const getInitials = (member: Pick<Admin, 'prenom' | 'nom'>) =>
  `${member.prenom?.[0] || ''}${member.nom?.[0] || ''}`.toUpperCase()

const getFormString = (form: FormData, key: string) => {
  const value = form.get(key)
  return typeof value === 'string' ? value : ''
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const apiError = error as ApiError
    const data = apiError.data as { errors?: string[] } | undefined
    return data?.errors?.join('. ') || error.message
  }

  return 'Une erreur inattendue est survenue'
}

function HomePage() {
  const { publications, events, albums, boardMembers, apiStatus } =
    useHomeData() as HomeData
  const [contactNotice, setContactNotice] = useState('')
  const [contactError, setContactError] = useState('')
  const [isSendingContact, setIsSendingContact] = useState(false)

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContactNotice('')
    setContactError('')
    setIsSendingContact(true)

    const formElement = event.currentTarget
    const form = new FormData(formElement)

    try {
      const data = await sendContactMessage({
        nom: getFormString(form, 'nom'),
        prenom: getFormString(form, 'prenom'),
        email: getFormString(form, 'email'),
        telephone: getFormString(form, 'telephone'),
        sujet: getFormString(form, 'sujet'),
        message: getFormString(form, 'message'),
      })
      setContactNotice(data.message)
      formElement.reset()
    } catch (error) {
      setContactError(getErrorMessage(error))
    } finally {
      setIsSendingContact(false)
    }
  }

  return (
    <main id="top">
      <section className="hero-section">
        <img src={heroImage} alt="" className="hero-section__image" />
        <div className="hero-section__overlay" />
        <div className="hero-section__content">
          <span className="hero-section__kicker">Bienvenue à l&apos;AGA</span>
          <h1>
            Association des
            <br />
            Guinéens d&apos;Angers
          </h1>
          <p>
            Unis pour promouvoir la culture, l&apos;entraide et la solidarité
            au sein de notre communauté.
          </p>
          <div className="hero-section__actions">
            <a className="button button--primary" href="#about">
              Découvrir l&apos;association
            </a>
            <a className="button button--light" href="#news">
              Voir les actualités
            </a>
          </div>
        </div>
        <span
          className={`api-indicator api-indicator--${apiStatus}`}
          title="État de connexion au backend"
        >
          <span />
          API {apiStatus === 'online' ? 'connectée' : 'mode démonstration'}
        </span>
      </section>

      <section className="values-strip" aria-label="Valeurs de l'association">
        <div className="values-strip__inner">
          {values.map(({ icon: Icon, title, text }) => (
            <article key={title} className="value-item">
              <span className="value-item__icon">
                <Icon size={20} />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="about-section__copy">
          <span className="section-kicker">Notre association</span>
          <h2>À propos de l&apos;AGA</h2>
          <p>
            L&apos;Association des Guinéens d&apos;Angers a pour objectif de
            rassembler les Guinéens vivant à Angers et ses environs, de
            promouvoir notre culture et d&apos;œuvrer pour l&apos;intégration et
            la solidarité.
          </p>
          <a className="button button--outline" href="#bureau">
            En savoir plus <ArrowRight size={16} />
          </a>
        </div>
        <img
          src={angersImage}
          alt="Vue panoramique d'Angers au bord de la Maine"
        />
      </section>

      <section className="section board-section" id="bureau">
        <div className="board-section__intro">
          <span className="section-kicker">Une équipe engagée</span>
          <h2>Le bureau de l&apos;association</h2>
          <p>
            Des bénévoles au service de la communauté guinéenne d&apos;Angers.
          </p>
        </div>
        <div className="board-section__grid">
          {boardMembers.map((member, index) => (
            <article className="board-card" key={member._id}>
              <div className={`board-card__avatar board-card__avatar--${index}`}>
                {getInitials(member)}
              </div>
              <h3>{member.prenom} {member.nom}</h3>
              <p>{member.fonction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band" id="news">
        <div className="section">
          <SectionHeading
            title="Actualités récentes"
            linkLabel="Voir toutes"
            href="/actualites"
          />
          <div className="news-grid">
            {publications.map((publication) => (
              <Link
                className="news-card"
                to={
                  String(publication._id).startsWith('fallback-')
                    ? '/actualites'
                    : `/publications/${publication._id}`
                }
                key={publication._id}
              >
                <img
                  src={getAssetUrl(publication.image, heroImage)}
                  alt=""
                  className="news-card__image"
                />
                <div className="news-card__shade" />
                <div className="news-card__content">
                  <span>{typeLabels[publication.type] || 'Actualité'}</span>
                  <h3>{publication.title}</h3>
                  <time>
                    {formatLongDate(
                      publication.publicationDate || publication.createdAt,
                    )}
                  </time>
                  <p>{publication.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section events-section" id="events">
        <SectionHeading
          title="Événements à venir"
          linkLabel="Voir tous"
          href="/evenements"
        />
        <div className="events-grid">
          {events.map((event) => {
            const [day, month] = formatShortDate(event.startDate).split(' ')

            return (
              <Link
                className="event-card"
                to={
                  String(event._id).startsWith('fallback-')
                    ? '/evenements'
                    : `/publications/${event._id}`
                }
                key={event._id}
              >
                <time className="event-card__date">
                  <strong>{day}</strong>
                  <span>{month}</span>
                </time>
                <div>
                  <h3>{event.title}</h3>
                  <p>
                    <MapPin size={14} /> {event.location || 'Angers'}
                  </p>
                  <p>
                    <Clock3 size={14} />
                    {event.startDate
                      ? new Date(event.startDate).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                    {event.endDate &&
                      ` - ${new Date(event.endDate).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="content-band" id="gallery">
        <div className="section">
          <SectionHeading
            title="Galerie"
            linkLabel="Voir la galerie"
            href="/galerie"
          />
          <div className="gallery-grid">
            {albums.map((album, index) => (
              <a
                className="gallery-card"
                href={
                  String(album._id).startsWith('fallback-')
                    ? '/galerie'
                    : `/galerie/${album._id}`
                }
                key={album._id}
              >
                <img
                  src={getAssetUrl(
                    album.coverImage,
                    index % 2 ? angersImage : heroImage,
                  )}
                  alt={album.title}
                />
                <span>{album.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="contact-section__intro">
          <span className="section-kicker">Restons en contact</span>
          <h2>Nous contacter</h2>
          <p>
            Une question, une suggestion ? N&apos;hésitez pas à nous écrire.
          </p>
          <div className="contact-details">
            <span>
              <MapPin size={18} /> 35 avenue Jean XXIII, 49000 Angers
            </span>
            <span>
              <Phone size={18} /> 06 09 97 54 14
            </span>
            <span>
              <Mail size={18} /> association.guineens.angers@gmail.com
            </span>
            <span>
              <CalendarDays size={18} /> Lun - Ven : 9h00 - 18h00
            </span>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="contact-form__row">
            <label>
              Nom
              <input name="nom" required />
            </label>
            <label>
              Prénom
              <input name="prenom" required />
            </label>
          </div>
          <div className="contact-form__row">
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Téléphone
              <input name="telephone" type="tel" />
            </label>
          </div>
          <label>
            Sujet
            <select name="sujet" defaultValue="" required>
              <option value="" disabled>
                Sélectionnez un sujet
              </option>
              <option>Adhésion</option>
              <option>Cotisation</option>
              <option>Événement</option>
              <option>Autre demande</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" rows={5} required />
          </label>
          <button
            className="button button--primary"
            type="submit"
            disabled={isSendingContact}
          >
            <Send size={16} />
            {isSendingContact ? 'Envoi...' : 'Envoyer le message'}
          </button>
          {contactNotice && <p className="contact-form__notice">{contactNotice}</p>}
          {contactError && (
            <p className="contact-form__notice contact-form__notice--error">
              {contactError}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default HomePage
