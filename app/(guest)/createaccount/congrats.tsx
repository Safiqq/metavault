/**
 * Congrats: Congratulations screen shown after successful 
 * Seed Phrase verification or import process completion.
 * 
 * This component handles the final step of the account creation/import flow,
 * providing users with confirmation and next steps.
 */

import { useNavigationState } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MedalStarIcon } from '@/assets/images/icons';
import { ProgressSteps } from '@/components/ProgressSteps';
import Spacer from '@/components/Spacer';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ROUTES } from '@/constants/AppConstants';
import { useAppState } from '@/contexts/AppStateProvider';
import { APP_STATES } from '@/lib/types';

import type { NavigationState } from '@react-navigation/native';

/**
 * Congratulations screen component for Seed Phrase flow completion
 */
export default function CongratsScreen(): React.JSX.Element {
  const safeAreaInsets = useSafeAreaInsets();
  const { state: appState, setState: setAppState } = useAppState();
  
  const navigationState = useNavigationState(
    (navState: NavigationState | undefined) => navState
  );
  
  const navigationRoutes = navigationState?.routes ?? [];
  const isFromRecoverVault = navigationRoutes.some(
    (route) => route.name === ROUTES.GUEST.RECOVER_VAULT
  );

  const handleDonePress = useCallback(() => {
    setAppState({
      ...appState,
      currentState: APP_STATES.LOGGED_IN_NEED_SESSION_RENEWAL,
    });
    router.push(ROUTES.USER.MY_VAULT.INDEX);
  }, [appState, setAppState]);

  return (
    <View 
      style={{ 
        paddingTop: safeAreaInsets.top, 
        paddingBottom: safeAreaInsets.bottom 
      }} 
      className={`flex-1 w-full bg-white ${
        Platform.OS === 'web' ? 'max-w-2xl mx-auto' : ''
      }`}
    >
      <ScrollView 
        className="flex-1 px-12"
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Congratulations screen content"
      >
        {isFromRecoverVault ? (
          <Header titleText="MetaVault" />
        ) : (
          <ProgressSteps currentStep={3} />
        )}
        
        <View className="my-10 items-center">
          <ThemedText 
            fontWeight={700} 
            fontSize={24} 
            className="text-center text-black"
            accessible={true}
            accessibilityRole="header"
          >
            Congratulations!
          </ThemedText>
          <Spacer size={16} />

          <MedalStarIcon 
            width={160} 
            height={160} 
            accessible={true}
            accessibilityLabel="Success medal icon"
          />

          <Spacer size={16} />

          {isFromRecoverVault ? (
            <ThemedText 
              className="text-center text-gray-700 px-4"
              fontSize={16}
              accessible={true}
              accessibilityRole="text"
            >
              Remember, if you lose your Seed Phrase, you lose access
              to your vault.
            </ThemedText>
          ) : (
            <View className="px-4">
              <ThemedText 
                className="text-center text-gray-700"
                fontSize={16}
                accessible={true}
                accessibilityRole="text"
              >
                Your vault is protected and ready to use. You can find your
                Seed Phrase in{' '}
                <ThemedText fontWeight={700} className="text-black">
                  Settings → Security & Privacy.
                </ThemedText>
              </ThemedText>

              <Spacer size={16} />

              <ThemedText
                className="text-center text-gray-600"
                fontSize={14}
                accessible={true}
                accessibilityRole="text"
              >
                Keep a reminder of your Seed Phrase somewhere safe.
                If you lose it, no one can help you get it back. Even worse, you
                won&apos;t be able to access your wallet ever again.{' '}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View className="px-12 pb-8">
        <Button
          text="Done"
          type="primary"
          onPress={handleDonePress}
          fontWeight={700}
          accessible={true}
          accessibilityLabel="Done"
          accessibilityHint="Complete setup and navigate to vault"
        />
      </View>
    </View>
  );
}
