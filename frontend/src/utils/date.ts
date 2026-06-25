const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

type DateInput = string | number | Date | undefined | null

export const formatShortDate = (date: DateInput) =>
  date ? shortDateFormatter.format(new Date(date)).replace('.', '') : ''

export const formatLongDate = (date: DateInput) =>
  date ? longDateFormatter.format(new Date(date)) : ''
