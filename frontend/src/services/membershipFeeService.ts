import api from './api'
import type {
  ApiMessage,
  EntityId,
  MembershipFee,
  MembershipFeePayload,
} from '../types/api'

export const getMembershipFees = async (
  signal?: AbortSignal,
): Promise<MembershipFee[]> => {
  const { data } = await api.get('/membership-fees', { signal })
  return data.fees
}

export const createMembershipFee = async (
  fee: MembershipFeePayload,
): Promise<MembershipFee> => {
  const { data } = await api.post('/membership-fees', fee)
  return data.fee
}

export const updateMembershipFee = async (
  id: EntityId,
  fee: MembershipFeePayload,
): Promise<MembershipFee> => {
  const { data } = await api.put(`/membership-fees/${id}`, fee)
  return data.fee
}

export const deleteMembershipFee = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/membership-fees/${id}`)
  return data
}
