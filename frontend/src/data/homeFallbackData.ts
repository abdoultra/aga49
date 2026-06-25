import heroImage from '../assets/aga-hero.webp'
import angersImage from '../assets/angers-river.webp'

export const fallbackPublications = [
  {
    _id: 'fallback-news',
    title: "Célébration de la fête de l'indépendance",
    content:
      "Retour en images sur la célébration de la fête de l'indépendance de la Guinée à Angers.",
    type: 'news',
    publicationDate: '2026-10-02',
    image: heroImage,
  },
  {
    _id: 'fallback-announcement',
    title: 'Appel à cotisation 2026',
    content:
      "Chers membres, la campagne annuelle de cotisation est désormais ouverte pour l'année 2026.",
    type: 'announcement',
    publicationDate: '2026-09-28',
    image: angersImage,
  },
  {
    _id: 'fallback-event-news',
    title: 'Journée culturelle guinéenne',
    content:
      'Une journée riche en activités culturelles, musicales et gastronomiques.',
    type: 'event',
    publicationDate: '2026-09-15',
    image: heroImage,
  },
]

export const fallbackEvents = [
  {
    _id: 'fallback-event-1',
    title: 'Réunion générale',
    startDate: '2026-06-25T14:00:00',
    endDate: '2026-06-25T17:00:00',
    location: 'Salle Jean Monnet, Angers',
  },
  {
    _id: 'fallback-event-2',
    title: 'Sortie détente en famille',
    startDate: '2026-06-28T10:00:00',
    endDate: '2026-06-28T18:00:00',
    location: 'Parc de Loisirs, Angers',
  },
  {
    _id: 'fallback-event-3',
    title: 'Soirée culturelle',
    startDate: '2026-07-20T16:00:00',
    endDate: '2026-07-20T22:00:00',
    location: 'Centre culturel, Angers',
  },
]

export const fallbackAlbums = [
  {
    _id: 'fallback-album-1',
    title: 'Célébration communautaire',
    coverImage: heroImage,
  },
  {
    _id: 'fallback-album-2',
    title: 'Angers, notre ville',
    coverImage: angersImage,
  },
  {
    _id: 'fallback-album-3',
    title: 'Culture guinéenne',
    coverImage: heroImage,
  },
  {
    _id: 'fallback-album-4',
    title: 'Vie associative',
    coverImage: angersImage,
  },
]

export const fallbackBoardMembers = [
  {
    _id: 'fallback-board-1',
    nom: 'Camara',
    prenom: 'Mamadou',
    fonction: 'Président',
  },
  {
    _id: 'fallback-board-2',
    nom: 'Bah',
    prenom: 'Aïssatou',
    fonction: 'Vice-présidente',
  },
  {
    _id: 'fallback-board-3',
    nom: 'Diallo',
    prenom: 'Sékou',
    fonction: 'Secrétaire général',
  },
]
