export function getCookieHeader(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=')
    if (separator === -1) return cookies
    const name = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (name) cookies[name] = decodeURIComponent(value)
    return cookies
  }, {})
}

export function sessionCookieOptions(config) {
  return {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    domain: config.COOKIE_DOMAIN || undefined,
    maxAge: 15 * 60 * 1000,
    path: '/',
  }
}
