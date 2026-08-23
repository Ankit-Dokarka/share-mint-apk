import {
  GoogleOneTapSignIn,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
  isCancelledResponse,
} from 'react-native-nitro-google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

GoogleOneTapSignIn.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export const getGoogleIdToken = async (): Promise<string> => {
  await GoogleOneTapSignIn.checkPlayServices();

  let response = await GoogleOneTapSignIn.signIn();

  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.presentExplicitSignIn();
  }

  if (isSuccessResponse(response)) {
    const { idToken } = response.data;

    if (!idToken) {
      throw new Error('Google ID token not found.');
    }

    return idToken;
  }

  if (isCancelledResponse(response)) {
    throw new Error('Google sign-in cancelled.');
  }

  if ('error' in response) {
    throw new Error(`Google sign-in failed: ${response.error}`);
  }

  throw new Error('Google sign-in failed.');
};

export const signOutGoogle = async (): Promise<void> => {
  await GoogleOneTapSignIn.signOut();
};
