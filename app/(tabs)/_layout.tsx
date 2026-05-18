import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: '#8b8b95',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: '#f8fbff',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        },
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerTitleAlign: 'center',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={focused ? '#16a34a' : color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="materias"
        options={{
          title: 'Materias',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              color={focused ? '#2563eb' : color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              color={focused ? '#f59e0b' : color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
