import { parseLink, parseLocations, parseName } from './parse'
import { Internship } from './types'

const url =
  'https://raw.githubusercontent.com/SimplifyJobs/Summer2024-Internships/dev/README.md'
const startSeparator =
  '<!-- Please leave a one line gap between this and the table TABLE_START (DO NOT CHANGE THIS LINE) -->\n'
const endSeparator =
  '<!-- Please leave a one line gap between this and the table TABLE_END (DO NOT CHANGE THIS LINE) -->'

// fetch data from github
export async function getInternships() {
  const response = await fetch(url)

  if (!response.ok) {
    window.alert('An error occurred fetching data')
    throw new Error('An error occurred fetching data')
  }

  const text = await response.text()

  const content = text
    .split(startSeparator)[1]
    .trim()
    .split(endSeparator)[0]
    .trim()

  const lines = content.split('\n').slice(2)

  const jobs = lines.map((line) =>
    line
      .split('|')
      .map((text) => text.trim())
      .slice(1)
  )

  let company = 'N/A'
  const internships: Internship[] = []

  for (const job of jobs) {
    if (job[0] && job[0] != '↳') company = parseName(job[0])

    internships.push({
      company,
      description: job[1],
      locations: parseLocations(job[2]),
      link: parseLink(job[3]),
    })
  }

  return internships
}
