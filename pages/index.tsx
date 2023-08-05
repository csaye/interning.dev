import levels from '@/levels.fyi.json'
import styles from '@/styles/pages/Index.module.scss'
import { getInternships } from '@/utils/getInternships'
import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { Company, Internship } from '@/utils/types'
import { LOCK_EMOJI } from '@/utils/parse'

const closedTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'yes', label: 'Closed' },
  { value: 'no', label: 'Not Closed' },
]

const appliedTypeOptions = [
  { value: 'all', label: 'All' },
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
  const [sponsorshipType, setSponsorshipType] = useState(
    sponsorshipTypeOptions[0]
  )
  const [companies, setCompanies] = useState<Company[] | null>(null)

  // filter internships
  const filteredInternships = useMemo(() => {
    if (!internships) return null
    const newInternships = [...internships]
    // const newInternships = internships.filter((internship) => {
    //   const { name, location, notes, applied } = internship
    //   const text = filterText.toLowerCase()

    //   const textMatch =
    //     !filterText ||
    //     name.toLowerCase().includes(text) ||
    //     location.toLowerCase().includes(text) ||
    //     notes.toLowerCase().includes(text)

    //   const closedMatch =
    //     closedType.value === 'all' ||
    //     (closedType.value === 'yes') === notes.includes('🔒 Closed 🔒')

    //   const appliedMatch =
    //     appliedType.value === 'all' || (appliedType.value === 'yes') === applied

    //   const hasCitizen = notes.toLowerCase().includes('citizen')
    //   const hasSponsorship =
    //     !notes.toLowerCase().includes('no sponsorship') && !hasCitizen

    //   const sponsorshipMatch =
    //     sponsorshipType.value === 'all' ||
    //     (sponsorshipType.value === 'yes' && hasSponsorship) ||
    //     (sponsorshipType.value === 'green_card' && !hasCitizen) ||
    //     (sponsorshipType.value === 'no' && !hasSponsorship)

    //   return textMatch && closedMatch && appliedMatch && sponsorshipMatch
    // })
    if (flipped) newInternships.reverse()
    return newInternships
  }, [internships, flipped])

  // update companies when internships update
  useEffect(() => {
    if (!filteredInternships) return

    const newCompanies: Company[] = []
    for (const internship of filteredInternships) {
      const company = newCompanies.find(
        ({ name }) => name === internship.company
      )
      if (company) {
        company.internships.push(internship)
      } else {
        newCompanies.push({
          name: internship.company,
          applied: getApplied(internship.company),
          internships: [internship],
        })
      }
    }
    setCompanies(newCompanies)

    function getApplied(company: string) {
      return window.localStorage.getItem(`Applied: ${company}`) === 'yes'
    }
  }, [filteredInternships])

  // initialize settings on start
  useEffect(() => {
    setDarkMode(window.localStorage.getItem('dark-mode') === 'yes')
    setFlipped(window.localStorage.getItem('flipped') === 'yes')
  }, [])

  async function getData() {
    setInternships(null)
    const internships = await getInternships()
    setInternships(internships)
  }

  // get data on start
  useEffect(() => {
    getData()
  }, [])

  // updates applied status for given internship
  function updateApplied(applied: boolean, company: string) {
    if (!companies) return
    const newCompanies = companies.map((c) =>
      c.name === company ? { ...c, applied } : c
    )
    setCompanies(newCompanies)

    // update local storage
    window.localStorage.setItem(`Applied: ${company}`, applied ? 'yes' : 'no')
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

  function getLink(rawText: string) {
    if (rawText.includes('<a href="')) {
      return (
        <a href={getLinkText()} target='_blank' rel='noopener noreferrer'>
          🔗
        </a>
      )
    }

    return rawText

    function getLinkText() {
      const link = rawText.split('<a href="')[1].split('">')[0]
      if (link.includes('?utm_source')) return link.split('?utm_source')[0]
      return link
    }
  }

  function getLevels(company: string) {
    const level: string | undefined = (levels as any)[company]
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
            href='https://github.com/SimplifyJobs/Summer2024-Internships'
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
      {companies && (
        <p>
          You have applied to{' '}
          <b>
            {companies.filter((c) => c.applied).length}/{companies.length}
          </b>{' '}
          companies!
          {filteredInternships && (
            <>
              {' '}
              (showing <b>{filteredInternships.length}</b> internships)
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
        <label>
          <span>Closed?</span>
          <Select
            options={closedTypeOptions}
            value={closedType}
            onChange={(value) => {
              if (value) setClosedType(value)
            }}
            aria-label='Closed Type'
          />
        </label>
        <label>
          <span>Applied?</span>
          <Select
            options={appliedTypeOptions}
            value={appliedType}
            onChange={(value) => {
              if (value) setAppliedType(value)
            }}
            aria-label='Applied Type'
          />
        </label>
        <label>
          <span>Sponsorship?</span>
          <Select
            options={sponsorshipTypeOptions}
            value={sponsorshipType}
            onChange={(value) => {
              if (value) setSponsorshipType(value)
            }}
            aria-label='Sponsorship Type'
          />
        </label>
      </div>
      {!companies ? (
        <p>Loading...</p>
      ) : !companies.length ? (
        <p>No companies found</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.row}>
            <div>Company</div>
            <div>Locations</div>
            <div>Internships</div>
            <div className={styles.small}>levels.fyi</div>
            <div className={styles.small}>Applied</div>
          </div>
          {companies.map((company, i) => (
            <div
              className={
                company.applied
                  ? `${styles.row} ${styles.selected}`
                  : styles.row
              }
              key={i}
            >
              <div>{company.name}</div>
              <div>
                {company.internships.map((internship, i) => (
                  <div key={i}>{internship.location}</div>
                ))}
              </div>
              <div>
                {company.internships.map((internship, i) => (
                  <InternshipData {...internship} key={i} />
                ))}
              </div>
              <div className={styles.small}>{getLevels(company.name)}</div>
              <div className={styles.small}>
                <input
                  checked={company.applied}
                  onChange={(e) =>
                    updateApplied(e.target.checked, company.name)
                  }
                  type='checkbox'
                  aria-label='Applied Status Checkbox'
                />
              </div>
            </div>
          ))}
          {/* {filteredInternships.map((internship, i) => (
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
              <div className={styles.small}>{getLink(internship.link)}</div>
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
          ))} */}
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

function InternshipData({ description, link }: Internship) {
  if (link === LOCK_EMOJI)
    return (
      <div>
        {LOCK_EMOJI} {description}
      </div>
    )

  return (
    <div>
      <a href={link} target='_blank' rel='noopener noreferrer'>
        {description}
      </a>
    </div>
  )
}
