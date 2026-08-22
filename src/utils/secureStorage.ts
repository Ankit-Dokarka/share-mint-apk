import * as Keychain from 'react-native-keychain';
import { SERVICE_NAME } from '@env';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(SERVICE_NAME, token, {
      service: SERVICE_NAME,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.error('Error saving token securely:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  } catch (error) {
    console.error('Error clearing token:', error);
    throw error;
  }
};
