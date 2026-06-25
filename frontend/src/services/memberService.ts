import api from './api'
import type { ApiMessage, EntityId, Member, MemberPayload } from '../types/api'

export const getMembers = async (signal?: AbortSignal): Promise<Member[]> => {
  const { data } = await api.get('/members', { signal })
  return data.members
}

export const createMember = async (member: MemberPayload): Promise<Member> => {
  const { data } = await api.post('/members', member)
  return data.member
}

export const updateMember = async (
  id: EntityId,
  member: Partial<MemberPayload>,
): Promise<Member> => {
  const { data } = await api.put(`/members/${id}`, member)
  return data.member
}

export const deleteMember = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/members/${id}`)
  return data
}
