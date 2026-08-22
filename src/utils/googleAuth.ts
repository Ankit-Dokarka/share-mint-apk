import {
  GoogleOneTapSignIn,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '@env';

GoogleOneTapSignIn.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export const getGoogleIdToken = async (): Promise<string> => {
  await GoogleOneTapSignIn.checkPlayServices();

  const response = await GoogleOneTapSignIn.signIn();

  if (isSuccessResponse(response)) {
    return response.data.idToken;
  }

  throw new Error('Google Sign-In was not completed');
};

export const signOutGoogle = async (): Promise<void> => {
  await GoogleOneTapSignIn.signOut();
};
