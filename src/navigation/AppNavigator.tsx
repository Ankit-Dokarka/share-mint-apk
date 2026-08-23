import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuth } from '../store/authSlice';
import { Spinner } from '../components/ui/Spinner';

export const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (status === 'idle' || status === 'loading') {
    return <Spinner />;
  }

  return (
    <NavigationContainer>
      {status === 'authenticated' ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
