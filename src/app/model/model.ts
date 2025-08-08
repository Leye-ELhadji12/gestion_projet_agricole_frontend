export interface Responsible {
  id?: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  role: Role;
  phone: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  VISITOR = 'VISITOR',
}

export interface ProjectResponse {
  content: Project[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  count: number;
}

export interface ResponsibleResponse {
  content: Responsible[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  count: number;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  status: ProjectStatus;
  responsibles?: Responsible[];
}

export enum ProjectStatus {
  EN_COURS = 'En_cours',
  TERMINE = 'Terminé',
  ANNULE = 'Annulé',
  PREVISIONNEL = 'Prévisionnel',
  PAUSE = 'Pause'
}

export interface ActivityResponse {
  content: Activity[];
  totalPages: number;
  number: number;
  size: number;
  countElement: number;
}

export interface Activity {
  id?: number;
  title: string;
  description: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate: Date;
  status: ActivityStatus;
  priorite: Priorite;
}

export enum ActivityStatus {
  EN_COURS = 'En_cours',
  TERMINE = 'Terminé',
  PAUSE = 'Pause',
  ANNULE = 'Annulé',
  PREVISIONNEL = 'Prévisionnel'
}

export enum Priorite {
  ELEVEE = 'Élevée',
  MOYENNE = 'Moyenne',
  NORMALE = 'Normale',
  FAIBLE = 'Faible'
}

export enum DocumentType {
  Report = 'Report',
  Contract = 'Contract',
  Invoice = 'Invoice',
  Letter = 'Letter',
  Specification = 'Spécification',
  Photo = 'Photo',
  Video = 'Vidéo',
  Autre = 'Autre'
}

export interface DocumentDTO {
  id?: number;
  originalFileName: string;
  fileType: string;
  filePath?: string;
  uploadDate?: Date;
  activityId: number;
  type: DocumentType;
  fileSize?: number;
}
