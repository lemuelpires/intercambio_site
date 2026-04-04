function resolveToBaseUrl(url, base) {
  const encodePath = (p) => p.split('/').map((s) => encodeURIComponent(s)).join('/')
  if (!url) return url
  if (url.startsWith('media/')) {
    return base + '/' + encodePath(url.slice(6))
  }
  if (url.includes('portalmantec.com.br/media/intercambio/')) {
    const pathMatch = url.match(/portalmantec\.com\.br\/media\/intercambio\/(.+?)(?:\?|$)/)
    if (pathMatch) {
      const pathSegment = pathMatch[1]
      return base + '/' + (pathSegment.includes('%') ? pathSegment : encodePath(pathSegment))
    }
  }
  return url
}

export function resolveMediaUrls(items, mediaBaseUrl) {
  if (!mediaBaseUrl) return items
  const base = mediaBaseUrl.replace(/\/$/, '')

  return items.map((item) => {
    const src = item.src || ''
    const resolvedSrc = resolveToBaseUrl(src, base)
    const thumb = item.thumb || ''
    const resolvedThumb =
      thumb && thumb !== src ? resolveToBaseUrl(thumb, base) : resolvedSrc
    return { ...item, src: resolvedSrc, thumb: resolvedThumb }
  })
}

export function getVideoMimeType(src) {
  if (!src) return 'video/mp4'
  const ext = (src.split('?')[0].split('.').pop() || '').toLowerCase()
  if (ext === 'mov') return 'video/quicktime'
  if (ext === 'webm') return 'video/webm'
  return 'video/mp4'
}

export function formatDate(dateString) {
  if (!dateString) return '–'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const CATEGORY_ICONS = {
  'Acomodações': '🏠',
  'Cientistas Cristãos': '⛪',
  'Começo': '🚀',
  'Desembarque em Boston': '✈️',
  'diversas': '📸',
  'EC College': '🎓',
  'Freedom Trail': '🛤️',
  'Harvard': '🎓',
  'Igreja no Quincy': '⛪',
  'M.I.T': '🔬',
  'Memorial de Guerra': '🪦',
  'Parque': '🌳',
  'Partida': '✈️',
  'Central Park': '🌳',
  'Downtown': '🏙️',
  'Empire State Building': '🏢',
  'Estatua da Liberdade': '🗽',
  'Memorial world Trade Center': '🕊️',
  'Pier': '⚓',
  'Ponte': '🌉',
  'times square': '🌃',
  'Videos': '🎥',
  'Viagem': '✈️',
  'Retorno': '🏠',
}

export const DEVICE_ICONS = {
  'Samsung A50': '📱',
  'iPhone 16': '📱',
  'Desconhecido': '📷',
}
