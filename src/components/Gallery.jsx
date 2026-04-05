import { useState, useEffect, useCallback } from 'react'
import { resolveMediaUrls } from '../utils/mediaUrl'

const ITEMS_PER_PAGE = 20

export default function Gallery({ dataUrl, title, subtitle }) {
  const [config, setConfig] = useState(null)
  const [allItems, setAllItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxItem, setLightboxItem] = useState(null)

  const openLightbox = useCallback((item) => {
    setLightboxItem(item)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxItem(null)
  }, [])

  useEffect(() => {
    setLightboxItem(null)
  }, [page])

  useEffect(() => {
    if (!lightboxItem) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxItem, closeLightbox])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [configRes, dataRes] = await Promise.all([
          fetch('/config.json'),
          fetch(dataUrl),
        ])
        if (cancelled) return
        const configData = configRes.ok ? await configRes.json() : {}
        const data = await dataRes.json()
        const rawItems = data.items || []
        const rawBase = configData.mediaBaseUrl
        const base =
          typeof rawBase === 'string' && rawBase.trim() ? rawBase.trim() : undefined
        const items = resolveMediaUrls(rawItems, base)
        setConfig(configData)
        setAllItems(items)
      } catch (e) {
        if (!cancelled) setError('Erro ao carregar a galeria. Verifique se o servidor está rodando.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [dataUrl])

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE
  const currentItems = allItems.slice(start, start + ITEMS_PER_PAGE)

  if (error) {
    return (
      <section className="gallery container">
        <div className="page-hero container">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div id="gallery-container" className="gallery-grid">
          <div className="error">
            <h3>⚠️ Erro de Conexão</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Tentar Novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-hero container">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="gallery container">
        {loading ? (
          <div className="loading" style={{ display: 'block' }}>
            <div className="spinner" />
            <p>Carregando galeria...</p>
          </div>
        ) : (
          <>
            <div id="gallery-container" className="gallery-grid">
              {currentItems.length === 0 ? (
                <div className="no-items">Nenhuma mídia encontrada.</div>
              ) : (
                currentItems.map((item) => (
                  <figure
                    key={item.src + (item.filename || '')}
                    className="gallery-item gallery-item--media-only"
                  >
                    {item.type === 'video' ? (
                      <button
                        type="button"
                        className="gallery-media-trigger"
                        onClick={() => openLightbox(item)}
                        aria-label={`Ampliar vídeo: ${item.title}`}
                      >
                        <video
                          className="gallery-media"
                          muted
                          playsInline
                          preload="metadata"
                          src={item.src}
                        />
                      </button>
                    ) : (
                      <GalleryImage
                        item={item}
                        useThumbnails={config?.useThumbnails !== false}
                        onOpen={openLightbox}
                      />
                    )}
                  </figure>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex' }}>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </button>
                <span id="page-info">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {lightboxItem ? (
        <div
          className="lightbox-backdrop"
          role="presentation"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Fechar"
          >
            ×
          </button>
          <div
            className="lightbox-inner"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxItem.title}
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxItem.type === 'video' ? (
              <video
                className="lightbox-media"
                controls
                autoPlay
                playsInline
                src={lightboxItem.src}
              />
            ) : (
              <img
                className="lightbox-media"
                src={lightboxItem.src}
                alt={lightboxItem.title}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}

function GalleryImage({ item, useThumbnails = true, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const thumb = item.thumb || item.src
  const gridSrc = !useThumbnails || imgError ? item.src : thumb

  return (
    <button
      type="button"
      className="gallery-media-trigger"
      onClick={() => onOpen(item)}
      aria-label={`Ampliar imagem: ${item.title}`}
    >
      <img
        className="gallery-media"
        src={gridSrc}
        alt=""
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </button>
  )
}
