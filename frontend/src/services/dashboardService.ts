import api from './api'
import type { AxiosPromise } from 'axios'
import type { DashboardData } from '../types/api'

const unwrap = <T>(request: AxiosPromise<Record<string, T>>, key: string) =>
  request.then(({ data }) => data[key])

export const getDashboardData = async (
  signal?: AbortSignal,
): Promise<DashboardData> => {
  const requests = await Promise.allSettled([
    unwrap<DashboardData['members']>(api.get('/members', { signal }), 'members'),
    unwrap<DashboardData['fees']>(api.get('/membership-fees', { signal }), 'fees'),
    unwrap<DashboardData['publications']>(
      api.get('/publications/manage', { signal }),
      'publications',
    ),
    unwrap<DashboardData['albums']>(api.get('/albums', { signal }), 'albums'),
    unwrap<DashboardData['documents']>(
      api.get('/documents/manage', { signal }),
      'documents',
    ),
    unwrap<DashboardData['messages']>(
      api.get('/contact-messages', { signal }),
      'messages',
    ),
  ])

  const valueOrEmpty = <T>(result: PromiseSettledResult<T>) =>
    result.status === 'fulfilled' ? result.value : []

  return {
    members: valueOrEmpty(requests[0]),
    fees: valueOrEmpty(requests[1]),
    publications: valueOrEmpty(requests[2]),
    albums: valueOrEmpty(requests[3]),
    documents: valueOrEmpty(requests[4]),
    messages: valueOrEmpty(requests[5]),
    hasPartialError: requests.some((result) => result.status === 'rejected'),
  }
}
