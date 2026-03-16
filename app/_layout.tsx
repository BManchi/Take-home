import 'react-native-gesture-handler'; // must be the very first import
import '../global.css';

import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { TransactionDetailSheet } from '../src/components/sheets/TransactionDetailSheet';
import { runMigrations } from '../src/database/runMigrations';
import { seedDatabase } from '../src/database/seed';
import { useTransactionStore } from '../src/stores/transactionStore';
import { useCategoryStore } from '../src/stores/categoryStore';
import { useAccountStore } from '../src/stores/accountStore';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

async function initDb(): Promise<void> {
  runMigrations();   // sync — creates tables if they don't exist
  await seedDatabase();
  await Promise.all([
    useTransactionStore.getState().initFromDb(),
    useCategoryStore.getState().initFromDb(),
    useAccountStore.getState().initFromDb(),
  ]);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('[DB] initDb failed:', err);
        setDbReady(true); // fall through to mocks
      });
  }, []);

  if (!fontsLoaded) return null;

  if (!dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <TransactionDetailSheet />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
