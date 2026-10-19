export interface Profile {
  name: string;
  title: string;
  headline: string;
  summary: string;
  focusAreas: string[];
  location: string;
  email: string;
  phone: string | null;
  linkedin: string;
  github: string | null;
  phoneVisibleOnSite: boolean;
}

export interface Highlight {
  from: string;
  to: string;
  caption: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface ProjectLinks {
  github: string | null;
  demo: string | null;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  featured: boolean;
  description: string[];
  tech: string[];
  links: ProjectLinks;
}

export interface Recognition {
  title: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  grade: string;
  location: string;
  start: string;
  end: string;
}

export interface FamiliarWith {
  label: string;
  note: string;
  items: string[];
}

export interface PortfolioContent {
  profile: Profile;
  highlight: Highlight;
  skills: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  recognition: Recognition[];
  education: Education[];
  familiarWith: FamiliarWith;
}

export interface ContactRequest {
  name: string;
  email: string;
  company: string;
  message: string;
  /** Honeypot: always empty for people. */
  website: string;
}

export interface ContactResponse {
  id: string;
  message: string;
}
