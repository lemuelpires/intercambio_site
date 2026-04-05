import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="logo">Intercâmbio</NavLink>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
          <NavLink to="/boston" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Boston</NavLink>
          <NavLink to="/newyork" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>New York</NavLink>
          <NavLink to="/retorno" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Volta ao Brasil</NavLink>
        </nav>
      </div>
    </header>
  )
}
