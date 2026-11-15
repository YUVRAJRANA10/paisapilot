function partsToUtc(parts) {
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]))
  return Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second)
}

function timezoneOffsetMs(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  return partsToUtc(formatter.formatToParts(date).filter(part => part.type !== 'literal')) - date.getTime()
}

function localBoundaryUtc(year, monthIndex, timezone) {
  const localGuess = Date.UTC(year, monthIndex, 1)
  const firstOffset = timezoneOffsetMs(new Date(localGuess), timezone)
  const firstUtc = localGuess - firstOffset
  const correctedOffset = timezoneOffsetMs(new Date(firstUtc), timezone)
  return new Date(localGuess - correctedOffset)
}

export function monthDateRange(month, timezone) {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return null
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) return null
  return {
    from: localBoundaryUtc(year, monthIndex, timezone),
    to: localBoundaryUtc(year, monthIndex + 1, timezone),
  }
}

export function yearDateRange(year, timezone) {
  if (!/^\d{4}$/.test(year)) return null
  const numericYear = Number(year)
  return {
    from: localBoundaryUtc(numericYear, 0, timezone),
    to: localBoundaryUtc(numericYear + 1, 0, timezone),
  }
}
