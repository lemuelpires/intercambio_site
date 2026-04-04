import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>{new Date().getFullYear()} Meu Intercâmbio. Feito com carinho.</p>
        </div>
      </footer>
    </>
  )
}
