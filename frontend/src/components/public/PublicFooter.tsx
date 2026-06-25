import { Camera, Mail, MapPin, MessageCircle, Phone, Play } from 'lucide-react'
import Logo from '../common/Logo'
import './PublicFooter.css'

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__grid">
        <div>
          <Logo light />
          <p>
            Unis pour promouvoir la culture, l&apos;entraide et la solidarité.
          </p>
          <div className="public-footer__socials" aria-label="Réseaux sociaux">
            <a href="#facebook" aria-label="Facebook">
              <MessageCircle size={17} />
            </a>
            <a href="#instagram" aria-label="Instagram">
              <Camera size={17} />
            </a>
            <a href="#youtube" aria-label="YouTube">
              <Play size={17} />
            </a>
          </div>
        </div>

        <div>
          <h3>Liens utiles</h3>
          <a href="/">Accueil</a>
          <a href="/#about">À propos</a>
          <a href="/#bureau">Bureau</a>
          <a href="/#news">Actualités</a>
        </div>

        <div>
          <h3>Ressources</h3>
          <a href="/galerie">Galerie</a>
          <a href="/documents">Documents</a>
          <a href="/#contact">Contact</a>
          <a href="/admin/login">Espace administration</a>
        </div>

        <div>
          <h3>Contact</h3>
          <span>
            <Mail size={15} /> association.guineens.angers@gmail.com
          </span>
          <span>
            <Phone size={15} /> 06 09 97 54 14
          </span>
          <span>
            <MapPin size={15} /> 35 avenue Jean XXIII, 49000 Angers
          </span>
        </div>
      </div>
      <div className="public-footer__bottom">
        © 2026 Association des Guinéens d&apos;Angers. Tous droits réservés.
      </div>
    </footer>
  )
}

export default PublicFooter
