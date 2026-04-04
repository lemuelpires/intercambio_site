import { useState, useEffect } from 'react'
import {
  resolveMediaUrls,
  getVideoMimeType,
  formatDate,
  CATEGORY_ICONS,
  DEVICE_ICONS,
} from '../utils/mediaUrl'

const ITEMS_PER_PAGE = 20

export default function Gallery({ dataUrl, title, subtitle }) {
  const [config, setConfig] = useState(null)
  const [allItems, setAllItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        const base = configData.mediaBaseUrl
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

  const filteredItems =
    filter === 'all'
      ? allItems
      : filter === 'photo'
        ? allItems.filter((i) => i.type === 'photo')
        : filter === 'video'
          ? allItems.filter((i) => i.type === 'video')
          : allItems.filter((i) => i.device === filter)

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE
  const currentItems = filteredItems.slice(start, start + ITEMS_PER_PAGE)

  const totalItems = allItems.length
  const samsungCount = allItems.filter((i) => i.device === 'Samsung A50').length
  const iphoneCount = allItems.filter((i) => i.device === 'iPhone 16').length

  const getDeviceIcon = (device) =>
    (config?.devices?.[device]?.icon) || DEVICE_ICONS[device] || '📷'
  const getCategoryIcon = (cat) => CATEGORY_ICONS[cat] || '📸'

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
        <div className="stats" id="stats">
          <div className="stat-item">
            <span className="stat-number">{loading ? '-' : totalItems}</span>
            <span className="stat-label">Total de mídias</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{loading ? '-' : samsungCount}</span>
            <span className="stat-label">Samsung A50</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{loading ? '-' : iphoneCount}</span>
            <span className="stat-label">iPhone 16</span>
          </div>
        </div>
      </section>

      <section className="gallery container">
        <div className="gallery-filters">
          {['all', 'Samsung A50', 'iPhone 16', 'photo', 'video'].map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              data-filter={f}
              onClick={() => { setFilter(f); setPage(1) }}
            >
              {f === 'all' ? 'Todas' : f === 'photo' ? 'Fotos' : f === 'video' ? 'Vídeos' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading" style={{ display: 'block' }}>
            <div className="spinner" />
            <p>Carregando galeria...</p>
          </div>
        ) : (
          <>
            <div id="gallery-container" className="gallery-grid">
              {currentItems.length === 0 ? (
                <div className="no-items">Nenhuma mídia encontrada para o filtro selecionado.</div>
              ) : (
                currentItems.map((item) => (
                  <figure
                    key={item.src + (item.filename || '')}
                    className="gallery-item"
                    data-device={item.device}
                    data-type={item.type}
                  >
                    {item.type === 'video' ? (
                      <video className="gallery-media" controls preload="metadata">
                        <source src={item.src} type={getVideoMimeType(item.src)} />
                        Seu navegador não suporta vídeos.
                      </video>
                    ) : (
                      <GalleryImage item={item} />
                    )}
                    <figcaption className="gallery-caption">
                      <div className="gallery-title">{item.title}</div>
                      <div className="gallery-meta">
                        <span className="device-info">
                          {getDeviceIcon(item.device)} {item.device}
                        </span>
                        <span className="category-info">
                          {getCategoryIcon(item.category)} {item.category}
                        </span>
                        <span className="date-info">{formatDate(item.date)}</span>
                      </div>
                      <div className="gallery-actions">
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => window.open(item.src, '_blank')}
                          title="Abrir em nova aba"
                        >
                          🔗
                        </button>
                        <button type="button" className="action-btn" title="Alternar tamanho">
                          🔍
                        </button>
                      </div>
                    </figcaption>
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
    </>
  )
}

function GalleryImage({ item }) {
  const [useFull, setUseFull] = useState(false)
  const [imgError, setImgError] = useState(false)
  const thumb = item.thumb || item.src
  const src = imgError || useFull ? item.src : thumb

  return (
    <img
      className="gallery-media"
      src={src}
      alt={item.title}
      loading="lazy"
      onError={() => setImgError(true)}
      onClick={() => setUseFull((u) => !u)}
    />
  )
}
