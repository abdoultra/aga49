export type EntityId = string

export type AdminRole = 'admin' | 'super_admin'
export type MemberStatus = 'actif' | 'inactif'
export type PublicationType = 'news' | 'announcement' | 'event'
export type PublicationStatus = 'draft' | 'published' | 'archived'
export type PublicationPriority = 'low' | 'normal' | 'high'
export type DocumentCategory =
  | 'administratif'
  | 'association'
  | 'compte-rendu'
  | 'formulaire'
  | 'other'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile_money' | 'other'
export type PaymentStatus = 'paid' | 'pending' | 'cancelled'
export type ContactMessageStatus = 'unread' | 'read' | 'processed'

export interface Admin {
  _id: EntityId
  id?: EntityId
  nom: string
  prenom: string
  email: string
  telephone?: string
  fonction?: string
  role: AdminRole
  actif?: boolean
  isActive?: boolean
  photo?: string
  ordre_affichage?: number
  date_debut_mandat?: string
  date_fin_mandat?: string
}

export interface AuthSession {
  token: string
  admin: Admin
}

export interface LoginCredentials {
  email: string
  mot_de_passe: string
}

export interface Member {
  _id: EntityId
  nom: string
  prenom: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  statut: MemberStatus
  date_adhesion?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export type MemberPayload = Omit<Member, '_id' | 'createdAt' | 'updatedAt'>

export interface DocumentResource {
  _id: EntityId
  title: string
  description?: string
  file: string
  originalName: string
  mimeType: string
  size: number
  category: DocumentCategory
  status: PublicationStatus
  publicationDate?: string
  downloadUrl?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: Pick<Admin, '_id' | 'nom' | 'prenom' | 'email'>
}

export type DocumentPayload = Partial<
  Pick<
    DocumentResource,
    'title' | 'description' | 'category' | 'status' | 'publicationDate'
  >
> & {
  file?: File | string | null
}

export interface Album {
  _id: EntityId
  title: string
  description?: string
  coverImage?: string
  photoCount?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: Pick<Admin, '_id' | 'nom' | 'prenom' | 'email'>
}

export type AlbumPayload = Partial<Pick<Album, 'title' | 'description'>> & {
  coverImage?: File | string | null
}

export interface Photo {
  _id: EntityId
  album: EntityId | Album
  image: string
  caption?: string
  displayOrder?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: Pick<Admin, '_id' | 'nom' | 'prenom' | 'email'>
}

export type PhotoPayload = Partial<Pick<Photo, 'caption' | 'displayOrder'>> & {
  image?: File | string | null
}

export interface AlbumDetails {
  album: Album
  photos: Photo[]
}

export interface MembershipFee {
  _id: EntityId
  member: EntityId | Member
  recordedBy?: EntityId | Pick<Admin, '_id' | 'nom' | 'prenom' | 'email'>
  year: number
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentDate?: string
  reference?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export type MembershipFeePayload = Partial<
  Pick<
    MembershipFee,
    | 'year'
    | 'amount'
    | 'paymentMethod'
    | 'paymentStatus'
    | 'paymentDate'
    | 'reference'
    | 'note'
  >
> & {
  member?: EntityId
}

export interface ContactMessage {
  _id: EntityId
  nom: string
  prenom: string
  email: string
  telephone?: string
  sujet: string
  message: string
  statut: ContactMessageStatus
  dateEnvoi?: string
  createdAt?: string
  updatedAt?: string
}

export type ContactMessagePayload = Pick<
  ContactMessage,
  'nom' | 'prenom' | 'email' | 'sujet' | 'message'
> &
  Partial<Pick<ContactMessage, 'telephone'>>

export interface Publication {
  _id: EntityId
  title: string
  content: string
  type: PublicationType
  status: PublicationStatus
  priority?: PublicationPriority
  image?: string
  location?: string
  startDate?: string
  endDate?: string
  publicationDate?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: Pick<Admin, '_id' | 'nom' | 'prenom' | 'email'>
}

export type PublicationPayload = Partial<
  Omit<Publication, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'image'>
> & {
  image?: File | string | null
}

export interface ApiMessage {
  message: string
}

export interface HealthResponse extends ApiMessage {
  status?: string
  database?: string
}

export interface BootstrapStatus {
  available: boolean
  adminCount?: number
}

export interface DashboardData {
  members: Member[]
  fees: MembershipFee[]
  publications: Publication[]
  albums: Album[]
  documents: DocumentResource[]
  messages: ContactMessage[]
  hasPartialError: boolean
}

export interface ApiError extends Error {
  status?: number
  data?: unknown
}
