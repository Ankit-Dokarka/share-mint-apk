import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
};

export type AppStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavProp = NativeStackNavigationProp<AppStackParamList>;
