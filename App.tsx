import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/Login';
import Home from './components/Home';
import Detail from './components/Detail';

// ─── TypeScript Route Param Definitions ────────────────────────────────────
export type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Detail: { movie: Movie };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Theme Constants ────────────────────────────────────────────────────────
const COLORS = {
  background: '#0D1B2A',
  primary: '#48CAE4',
  secondary: '#0077B6',
  text: '#E0E1DD',
  headerBorder: '#0077B620',
};

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            color: COLORS.text,
            //letterSpacing: 0.5,
          },
          headerShadowVisible: true,
          //headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: '🎬  Movie Explorer',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{ title: 'Movie Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}