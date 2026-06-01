import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { resolveMediaUrls } from '../utils/mediaUrl'

const ITEMS_PER_PAGE = 20
const CATEGORY_LABELS = {
  'Suprema Corte Michigan': 'Suprema Corte Massachusets',
}

const VIDEO_THUMB_EXT = /\.(mov|mp4|webm)(?:\?.*)?$/i
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg)(?:\?.*)?$/i

function getVideoPreviewSrc(thumb) {
  if (!thumb) return ''
  if (IMAGE_EXT.test(thumb)) return thumb
  if (VIDEO_THUMB_EXT.test(thumb)) return thumb.replace(VIDEO_THUMB_EXT, '.jpg')
  return ''
}

export default function Gallery({ dataUrl, title, subtitle, showCategories = false }) {
  const [config, setConfig] = useState(null)
  const [allItems, setAllItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxItem, setLightboxItem] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const galleryTopRef = useRef(null)

  const openLightbox = useCallback((item) => {
    setLightboxItem(item)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxItem(null)
  }, [])

  useEffect(() => {
    setLightboxItem(null)
    if (galleryTopRef.current) {
      requestAnimationFrame(() => {
        galleryTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [page])

  useEffect(() => {
    setPage(1)
    setLightboxItem(null)
  }, [selectedCategory])

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

  const categories = useMemo(() => {
    if (!showCategories) return []
    const map = new Map()
    allItems.forEach((item) => {
      const category = item.category || 'Outros'
      if (!map.has(category)) map.set(category, [])
      map.get(category).push(item)
    })
    return Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        items,
        count: items.length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [allItems, showCategories])

  const filteredItems = selectedCategory
    ? allItems.filter((item) => item.category === selectedCategory)
    : allItems

  const lightboxIndex = lightboxItem
    ? filteredItems.findIndex(
        (item) =>
          item.src === lightboxItem.src &&
          (item.filename || '') === (lightboxItem.filename || '')
      )
    : -1

  const showPrevLightbox = lightboxIndex > 0
  const showNextLightbox = lightboxIndex >= 0 && lightboxIndex < filteredItems.length - 1

  const openPrevLightbox = useCallback(() => {
    if (showPrevLightbox) {
      setLightboxItem(filteredItems[lightboxIndex - 1])
    }
  }, [filteredItems, lightboxIndex, showPrevLightbox])

  const openNextLightbox = useCallback(() => {
    if (showNextLightbox) {
      setLightboxItem(filteredItems[lightboxIndex + 1])
    }
  }, [filteredItems, lightboxIndex, showNextLightbox])

  useEffect(() => {
    if (!lightboxItem) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') openPrevLightbox()
      if (e.key === 'ArrowRight') openNextLightbox()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxItem, closeLightbox, openPrevLightbox, openNextLightbox])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE
  const currentItems = filteredItems.slice(start, start + ITEMS_PER_PAGE)

  if (error) {
    return (
      <section className="gallery container" ref={galleryTopRef}>
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
        {showCategories && categories.length > 0 && (
          <div className="gallery-filters">
            <button
              type="button"
              className={`filter-btn ${selectedCategory ? '' : 'active'}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {CATEGORY_LABELS[category.name] || category.name}
              </button>
            ))}
          </div>
        )}
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
                        <GalleryVideoThumbnail item={item} />
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
            {showPrevLightbox && (
              <button
                type="button"
                className="lightbox-nav lightbox-nav--prev"
                aria-label="Imagem anterior"
                onClick={(e) => {
                  e.stopPropagation()
                  openPrevLightbox()
                }}
              >
                ‹
              </button>
            )}

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

            {showNextLightbox && (
              <button
                type="button"
                className="lightbox-nav lightbox-nav--next"
                aria-label="Próxima imagem"
                onClick={(e) => {
                  e.stopPropagation()
                  openNextLightbox()
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}

function GalleryVideoThumbnail({ item }) {
  const [previewError, setPreviewError] = useState(false)
  const previewSrc = getVideoPreviewSrc(item.thumb)
  const showImagePreview = previewSrc && !previewError

  return (
    <div
      className={`gallery-video-thumb ${showImagePreview ? 'has-thumb' : 'fallback'}`}
      aria-hidden="true"
    >
      {showImagePreview ? (
        <img
          className="gallery-video-thumb-image"
          src={previewSrc}
          alt={`Prévia de vídeo: ${item.title}`}
          loading="lazy"
          decoding="async"
          onError={() => setPreviewError(true)}
        />
      ) : (
        <div className="gallery-video-thumb-placeholder" />
      )}

      <div className="gallery-video-thumb-overlay" />
      <div className="gallery-video-thumb-label">Vídeo</div>
    </div>
  )
}

function GalleryImage({ item, useThumbnails = true, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const thumb = item.thumb || item.src
  const gridSrc = !useThumbnails || imgError ? item.src : thumb
  const width = item.tw || 400
  const height = item.th || 300

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
        alt={item.title || ''}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    </button>
  )
}
