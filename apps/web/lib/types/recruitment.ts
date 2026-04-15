export type RecruitmentFormData = {
  // Step 0: Basic Info
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  gdprConsent: boolean;

  // Step 1: Experience & Skills
  education: string;
  experience: string;
  skills: string[];
  otherSkills: string;

  // Step 2: Motivation & Interests
  motivation: string;
  interests: string;
  preferredRole: string;
  availability: string;

  // Step 3: Task
  task?: string;
  taskTitle?: string;

  // Documents
  resumeUrl?: string;
};

export type RecruitmentStep = {
  id: number;
  title: string;
  description: string;
};

export const RECRUITMENT_STEPS: RecruitmentStep[] = [
  {
    id: 0,
    title: "Základní údaje",
    description: "Vaše kontaktní informace",
  },
  {
    id: 1,
    title: "Zkušenosti",
    description: "Vzdělání, praxe a dovednosti",
  },
  {
    id: 2,
    title: "Motivace",
    description: "Proč se chcete přidat a co vás zajímá",
  },
  {
    id: 3,
    title: "Úloha",
    description: "Jednoduchý úkol na základě vašich zájmů",
  },
  {
    id: 4,
    title: "Pohovor",
    description: "Rezervujte si termín pohovoru",
  },
  {
    id: 5,
    title: "Souhrn",
    description: "Zkontrolujte a odešlete",
  },
];

export const AVAILABLE_SKILLS = [
  "Programování (Python, C/C++, JavaScript)",
  "CAD modelování (SolidWorks, Fusion 360)",
  "Elektronika a embedded systémy",
  "Mechanika a konstrukce",
  "Chemie a pyrotechnika",
  "3D tisk a výroba",
  "Grafický design",
  "Video production",
  "Projektové řízení",
  "Marketing a PR",
];

export const AVAILABLE_ROLES = [
  "Software vývojář",
  "Mechanical engineer",
  "Electrical engineer",
  "Chemik",
  "Projektový manažer",
  "Marketing specialist",
  "Grafický designér",
  "Jiné (upřesním v motivaci)",
];
