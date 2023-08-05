const LOCK_EMOJI = '🔒'

export function parseName(rawName: string) {
  const name = rawName.replaceAll('*', '')

  if (name.includes('](')) {
    return name.split('](')[0].slice(1)
  }

  return name
}

export function parseLink(rawLink: string) {
  if (rawLink.includes('LOCK_EMOJI')) return LOCK_EMOJI

  if (rawLink.includes('<a href="')) {
    const link = rawLink.split('<a href="')[1].split('">')[0]
    if (link.includes('?utm_source')) return link.split('?utm_source')[0]
    return link
  }

  return rawLink
}
