import { useEffect, useState } from 'react'
import type { Admin, Album, Publication } from '../types/api'
import {
  fallbackAlbums,
  fallbackBoardMembers,
  fallbackEvents,
  fallbackPublications,
} from '../data/homeFallbackData'
import {
  getAlbums,
  getBoardMembers,
  getHealth,
  getLatestPublications,
  getUpcomingEvents,
} from '../services/publicService'

export interface HomeData {
  publications: Publication[]
  events: Publication[]
  albums: Album[]
  boardMembers: Admin[]
  apiStatus: 'loading' | 'online' | 'offline'
}

const initialState: HomeData = {
  publications: fallbackPublications.map((publication) => ({
    ...publication,
    type: publication.type,
    status: 'published',
  })) as Publication[],
  events: fallbackEvents.map((event) => ({
    ...event,
    content: '',
    type: 'event',
    status: 'published',
  })) as Publication[],
  albums: fallbackAlbums,
  boardMembers: fallbackBoardMembers.map((member) => ({
    ...member,
    email: '',
    role: 'admin',
  })) as Admin[],
  apiStatus: 'loading',
}

function useHomeData(): HomeData {
  const [data, setData] = useState(initialState)

  useEffect(() => {
    const controller = new AbortController()

    const loadHomeData = async () => {
      const [health, publications, events, albums, boardMembers] =
        await Promise.allSettled([
        getHealth(controller.signal),
        getLatestPublications(controller.signal),
        getUpcomingEvents(controller.signal),
        getAlbums(controller.signal),
        getBoardMembers(controller.signal),
      ])

      if (controller.signal.aborted) return

      setData({
        apiStatus:
          health.status === 'fulfilled' && health.value.status === 'ok'
            ? 'online'
            : 'offline',
        publications:
          publications.status === 'fulfilled' && publications.value.length
            ? publications.value.slice(0, 3)
            : initialState.publications,
        events:
          events.status === 'fulfilled' && events.value.length
            ? events.value.slice(0, 3)
            : initialState.events,
        albums:
          albums.status === 'fulfilled' && albums.value.length
            ? albums.value.slice(0, 4)
            : fallbackAlbums,
        boardMembers:
          boardMembers.status === 'fulfilled' && boardMembers.value.length
            ? boardMembers.value
            : initialState.boardMembers,
      })
    }

    loadHomeData()

    return () => controller.abort()
  }, [])

  return data
}

export default useHomeData
