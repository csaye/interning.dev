export type Internship = {
  company: string
  locations: string[]
  description: string
  link: string
}

export type ApplicationStatus = 'none' | 'waiting' | 'oa' | 'rejected' | 'offer'

export type Company = {
  name: string
  applied: boolean
  status: ApplicationStatus
  internships: Internship[]
}
