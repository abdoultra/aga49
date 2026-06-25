import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from '../common/Logo'
import './PublicHeader.css'

const navigation: Array<[string, string]> = [
  ['Accueil', '/'],
  ['À propos', '/#about'],
  ['Bureau', '/#bureau'],
  ['Actualités', '/#news'],
  ['Événements', '/#events'],
  ['Galerie', '/galerie'],
  ['Documents', '/documents'],
  ['Contact', '#contact'],
]

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <a href="/" aria-label="AGA, retour à l'accueil">
          <Logo />
        </a>

        <button
          className="public-header__menu-button"
          type="button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav
          className={`public-header__nav ${
            menuOpen ? 'public-header__nav--open' : ''
          }`}
          aria-label="Navigation principale"
        >
          {navigation.map(([label, href], index) => (
            <a
              key={label}
              className={index === 0 ? 'is-active' : ''}
              href={href}
              onClick={closeMenu}
            >
              {label}
            </a>
          ))}
          <a
            className="public-header__cta"
            href="/#contact"
            onClick={closeMenu}
          >
            Nous rejoindre
          </a>
        </nav>
      </div>
    </header>
  )
}

export default PublicHeader
