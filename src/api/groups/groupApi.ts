import { apiRequest } from '../request';
import type { GroupsResponse } from '../../types/group';

export const groupAPI = {
  getGroups: () =>
    apiRequest<GroupsResponse>({ method: 'GET', url: '/api/groups' }),
};
