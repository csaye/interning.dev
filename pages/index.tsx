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

  return (
    <div className={styles.container}>
    </div>
  );
}
