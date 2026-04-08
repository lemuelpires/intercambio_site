import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import logoIcon from '../imagens/icones/icone1.png'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavClick = () => {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="logo">
          <img src={logoIcon} alt="Ícone do site" className="logo-icon" />
          Intercâmbio - CPS
        </NavLink>
        <button
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <nav id="primary-nav" className={`nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={handleNavClick}>Home</NavLink>
          <NavLink to="/boston" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>Boston</NavLink>
          <NavLink to="/newyork" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>New York</NavLink>
          <NavLink to="/retorno" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>Chegada ao Brasil</NavLink>
        </nav>
      </div>
    </header>
  )
}
