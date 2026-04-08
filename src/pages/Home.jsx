import { Link } from 'react-router-dom'
import BOSTON_IMG from '../imagens/boston.png'
import NEWYORK_IMG from '../imagens/newyork.png'

export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-text">
          <h1>Meu intercâmbio cultural</h1>
          <p>
            Uma breve jornada pelas minhas experiências em <strong>Boston</strong> e <strong>New York</strong>{' '}
            duas cidades que me inspiraram com sua história, arquitetura e energia.
          </p>
        </div>
      </section>

      <section className="cards container">
        <article className="card">
          <Link to="/boston" className="card-link" aria-label="Ver galeria de Boston">
            <figure className="card-media" style={{ '--bg': `url('${BOSTON_IMG}')` }} />
            <div className="card-content">
              <h2>Boston</h2>
              <p>Galeria de fotos capturando a essência acadêmica e histórica da cidade.</p>
              <span className="btn">Ver galeria</span>
            </div>
          </Link>
        </article>
        <article className="card">
          <Link to="/newyork" className="card-link" aria-label="Ver galeria de New York">
            <figure className="card-media" style={{ '--bg': `url('${NEWYORK_IMG}')` }} />
            <div className="card-content">
              <h2>New York</h2>
              <p>Imagens da cidade que nunca dorme: ritmo, arte e arranha-céus.</p>
              <span className="btn">Ver galeria</span>
            </div>
          </Link>
        </article>
      </section>
    </>
  )
}
