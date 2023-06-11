import Cell from '@/components/Cell';
import styles from '@/styles/pages/Index.module.scss';
import { useEffect, useState } from 'react';

const url = 'https://raw.githubusercontent.com/pittcsc/Summer2024-Internships/dev/README.md';
const separator = '<!-- Please leave a one line gap between this and the table -->\n';

type Internship = {
  name: string;
  location: string;
  notes: string;
  applied: boolean;
};

function parseName(text: string) {
  if (text.includes('](')) {
    return text.split('](')[0].slice(1);
  }

  return text;
}

export default function Index() {
  const [internships, setInternships] = useState<Internship[] | null>(null);

  // fetch data from github
  async function getData() {
    setInternships(null);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('An error occurred fetching data');
    }
    const text = await response.text();
    const content = text.split(separator)[1].trim();
    const lines = content.split('\n').slice(2);
    const jobs = lines.map(line => line.split('|').map(text => text.trim()).filter(text => !!text));
    setInternships(jobs.map((job) => ({
      name: job[0],
      location: job[1],
      notes: job[2],
      applied: getApplied(job[0])
    })));

    function getApplied(name: string) {
      const jobName = parseName(name);
      return window.localStorage.getItem(`Applied: ${jobName}`) === 'yes';
    }
  }

  // get data on start
  useEffect(() => {
    getData();
  }, []);

  // updates applied status for given internship
  function updateApplied(applied: boolean, internship: Internship) {
    if (!internships) return;
    const newInternships = internships.slice();
    const index = newInternships.findIndex(i => i.name === internship.name);
    if (index === -1) return;
    newInternships[index].applied = applied;
    setInternships(newInternships);

    // update local storage
    const jobName = parseName(internship.name);
    window.localStorage.setItem(`Applied: ${jobName}`, applied ? 'yes' : 'no');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p>
          Data from{' '}
          <a href="https://github.com/pittcsc/Summer2024-Internships" target="_blank" rel="noopener noreferrer">
            PittCSC
          </a>
        </p>
        <button onClick={() => getData()}>
          Refresh
        </button>
      </div>
      {
        !internships ? <p>Loading...</p> :
          <div className={styles.table}>
            <div className={styles.row}>
              <div>Name</div>
              <div>Location</div>
              <div>Notes</div>
              <div>Applied</div>
            </div>
            {
              internships.map((internship, i) =>
                <div className={styles.row} key={i}>
                  <Cell text={internship.name} />
                  <Cell text={internship.location} />
                  <Cell text={internship.notes} />
                  <div>
                    <input
                      checked={internship.applied}
                      onChange={e => updateApplied(e.target.checked, internship)}
                      type="checkbox"
                    />
                  </div>
                </div>
              )
            }
          </div>
      }
    </div>
  );
}
