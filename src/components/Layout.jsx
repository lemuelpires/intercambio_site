import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <button
        className={`back-to-top ${showBackToTop ? 'is-visible' : ''}`}
        type="button"
        aria-label="Voltar ao topo"
        onClick={handleBackToTop}
      >
        ↑
      </button>
      <footer className="site-footer">
        <div className="container">
          <p>{new Date().getFullYear()} Meu IntercÃ¢mbio. Feito com carinho.</p>
        </div>
      </footer>
    </>
  )
}
