import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { groupAPI } from '../api/groups/groupApi';
import { getFriendlyError } from '../utils/getFriendlyError';
import type { Group, CreateGroupPayload } from '../types/group';

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  isCreatingGroup: boolean;
}

const initialState: GroupState = {
  groups: [],
  isLoading: false,
  error: null,
  isCreatingGroup: false,
};

export const fetchGroups = createAsyncThunk<Group[], void>(
  'group/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupAPI.getGroups();
      return response.groups;
    } catch (error) {
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

export const createGroup = createAsyncThunk<Group, CreateGroupPayload>(
  'group/createGroup',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await groupAPI.createGroup(payload);
      return response;
    } catch (error) {
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGroups.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createGroup.pending, state => {
        state.isCreatingGroup = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isCreatingGroup = false;
        state.groups.unshift(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isCreatingGroup = false;
        state.error = action.payload as string;
      });
  },
});

export default groupSlice.reducer;
