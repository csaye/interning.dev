type Props = string | { name: string }

export function parseName(props: Props) {
  const rawName = typeof props === 'string' ? props : props.name
  const name = rawName.replaceAll('*', '')

  if (name.includes('](')) {
    return name.split('](')[0].slice(1)
  }

  return name
}
