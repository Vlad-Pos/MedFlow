type Dict = Record<string, string>

const ro: Dict = {
  dashboard: 'Tablou de bord',
}

const dictionaries: Record<string, Dict> = { ro }

export function t(key: string, locale = 'ro') {
  return dictionaries[locale]?.[key] || key
}