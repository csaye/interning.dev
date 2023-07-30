import Cell from '@/components/Cell'
import levels from '@/levels.fyi.json'
import styles from '@/styles/pages/Index.module.scss'
import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'

const url =
  'https://raw.githubusercontent.com/pittcsc/Summer2024-Internships/dev/README.md'
const separator =
  '<!-- Please leave a one line gap between this and the table -->\n'

type Internship = {
  name: string
  location: string
  notes: string
  applied: boolean
}

function parseName(text: string) {
  if (text.includes('](')) {
    return text.split('](')[0].slice(1)
  }

  return text
}

const closedTypeOptions = [
  { value: 'all', label: 'Closed & Not Closed' },
  { value: 'yes', label: 'Closed' },
  { value: 'no', label: 'Not Closed' },
]

const appliedTypeOptions = [
  { value: 'all', label: 'Applied & Not Applied' },
  { value: 'yes', label: 'Applied' },
  { value: 'no', label: 'Not Applied' },
]

const sponsorshipTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'green_card', label: 'US Citizenship Not Required' },
  { value: 'yes', label: 'Sponsorship Offered' },
  { value: 'no', label: 'No Sponsorship' },
]

export default function Index() {
  const [internships, setInternships] = useState<Internship[] | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [closedType, setClosedType] = useState(closedTypeOptions[0])
  const [appliedType, setAppliedType] = useState(appliedTypeOptions[0])
  const [sponsorshipType, setSponsorshipType] = useState(sponsorshipTypeOptions[0])

  // filter internships
  const filteredInternships = useMemo(() => {
    if (!internships) return null
    const newInternships = internships.filter((internship) => {
      const { name, location, notes, applied } = internship
      const text = filterText.toLowerCase()
      const textMatch =
        !filterText ||
        name.toLowerCase().includes(text) ||
        location.toLowerCase().includes(text) ||
        notes.toLowerCase().includes(text)
      const closedMatch =
        closedType.value === 'all' ||
        (closedType.value === 'yes') === notes.includes('🔒 Closed 🔒')
      const appliedMatch =
        appliedType.value === 'all' || (appliedType.value === 'yes') === applied
      const sponsorshipMatch =
        sponsorshipType.value === 'all' ||
        (sponsorshipType.value === 'yes') && !notes.toLowerCase().includes('no sponsorship') 
                                          && !notes.toLowerCase().includes('citizen') ||
        (sponsorshipType.value === 'green_card' && !notes.toLowerCase().includes('citizen')) ||
        (sponsorshipType.value === 'no') && notes.toLowerCase().includes('no sponsorship')
      return textMatch && closedMatch && appliedMatch && sponsorshipMatch
    })
    if (flipped) newInternships.reverse()
    return newInternships
  }, [internships, flipped, filterText, closedType.value, appliedType.value, sponsorshipType.value])

  // initialize settings on start
  useEffect(() => {
    setDarkMode(window.localStorage.getItem('dark-mode') === 'yes')
    setFlipped(window.localStorage.getItem('flipped') === 'yes')
  }, [])

  // fetch data from github
  async function getData() {
    setInternships(null)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('An error occurred fetching data')
    }
    const text = await response.text()
    const content = text.split(separator)[1].trim()
    const lines = content.split('\n').slice(2)
    const jobs = lines.map((line) =>
      line
        .split('|')
        .map((text) => text.trim())
        .filter((text) => !!text)
    )
    setInternships(
      jobs.map((job) => ({
        name: job[0],
        location: job[1],
        notes: job[2],
        applied: getApplied(job[0]),
      }))
    )

    function getApplied(name: string) {
      const jobName = parseName(name)
      return window.localStorage.getItem(`Applied: ${jobName}`) === 'yes'
    }
  }

  // get data on start
  useEffect(() => {
    getData()
  }, [])

  // updates applied status for given internship
  function updateApplied(applied: boolean, internship: Internship) {
    if (!internships) return
    const newInternships = internships.slice()
    const index = newInternships.findIndex((i) => i.name === internship.name)
    if (index === -1) return
    newInternships[index].applied = applied
    setInternships(newInternships)

    // update local storage
    const jobName = parseName(internship.name)
    window.localStorage.setItem(`Applied: ${jobName}`, applied ? 'yes' : 'no')
  }

  function toggleDarkMode() {
    const isDarkMode = !darkMode
    setDarkMode(isDarkMode)
    window.localStorage.setItem('dark-mode', isDarkMode ? 'yes' : 'no')
  }

  function toggleFlipped() {
    const isFlipped = !flipped
    setFlipped(isFlipped)
    window.localStorage.setItem('flipped', isFlipped ? 'yes' : 'no')
  }

  function getLevels(internship: Internship) {
    const name = parseName(internship.name)
    const level: string | undefined = (levels as any)[name]
    if (!level) return null

    return (
      <a href={level} target='_blank' rel='noopener noreferrer'>
        🔗
      </a>
    )
  }

  return (
    <div
      className={
        darkMode ? `${styles.container} ${styles.darkMode}` : styles.container
      }
    >
      <h1>interning.dev</h1>
      <p>
        ⚠️ Not affiliated with{' '}
        <a
          href='https://pittcsc.org/'
          target='_blank'
          rel='noopener noreferrer'
        >
          PittCSC
        </a>
      </p>
      <ul>
        <li>
          Data from{' '}
          <a
            href='https://github.com/pittcsc/Summer2024-Internships'
            target='_blank'
            rel='noopener noreferrer'
          >
            PittCSC
          </a>
        </li>
        <li>
          This dashboard is open source!{' '}
          <a
            href='https://github.com/csaye/interning.dev'
            target='_blank'
            rel='noopener noreferrer'
          >
            Star us on GitHub
          </a>
        </li>
        <li>
          Made by{' '}
          <a
            href='https://github.com/csaye'
            target='_blank'
            rel='noopener noreferrer'
          >
            Cooper Saye
          </a>
        </li>
      </ul>
      <div className={styles.buttons}>
        <button
          aria-label='Toggle ascending/descending order'
          onClick={() => toggleFlipped()}
        >
          {flipped ? '⬆️' : '⬇️'}
        </button>
        <button
          aria-label='Toggle dark/light mode'
          onClick={() => toggleDarkMode()}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          aria-label='Refresh internship list'
          className={styles.refreshButton}
          onClick={() => getData()}
        >
          🔄
        </button>
      </div>
      {internships && (
        <p>
          You have applied to{' '}
          <b>
            {internships.filter((i) => i.applied).length}/{internships.length}
          </b>{' '}
          internships!
          {filteredInternships &&
            filteredInternships.length !== internships.length && (
              <>
                {' '}
                (showing <b>{filteredInternships.length})</b>
              </>
            )}
        </p>
      )}
      <div className={styles.filters}>
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder='Filter by text...'
        />
        <span style={{ flexGrow: 1 }} />
        <Select
          options={closedTypeOptions}
          value={closedType}
          onChange={(value) => {
            if (value) setClosedType(value)
          }}
          aria-label='Closed Type'
        />
        <Select
          options={appliedTypeOptions}
          value={appliedType}
          onChange={(value) => {
            if (value) setAppliedType(value)
          }}
          aria-label='Applied Type'
        />
        <Select
          options={sponsorshipTypeOptions}
          value={sponsorshipType}
          onChange={(value) => {
            if (value) setSponsorshipType(value)
          }}
          aria-label='Sponsorship Type'
        />
      </div>
      {!filteredInternships ? (
        <p>Loading...</p>
      ) : !filteredInternships.length ? (
        <p>No internships found</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.row}>
            <div>Name</div>
            <div>Location</div>
            <div>Notes</div>
            <div className={styles.small}>levels.fyi</div>
            <div className={styles.small}>Applied</div>
          </div>
          {filteredInternships.map((internship, i) => (
            <div
              className={
                internship.applied
                  ? `${styles.row} ${styles.selected}`
                  : styles.row
              }
              key={i}
            >
              <Cell text={internship.name} />
              <Cell text={internship.location} />
              <Cell text={internship.notes} />
              <div className={styles.small}>{getLevels(internship)}</div>
              <div className={styles.small}>
                <input
                  checked={internship.applied}
                  onChange={(e) => updateApplied(e.target.checked, internship)}
                  type='checkbox'
                  aria-label='Applied Status Checkbox'
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.footer}>
        <button
          aria-label='Back to top of list'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ⬆️
        </button>
      </div>
    </div>
  )
}
