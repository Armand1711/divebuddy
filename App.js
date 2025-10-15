import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import GearCheckScreen from './screens/GearCheckScreen';
import DivePlanScreen from './screens/DivePlanScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GearCheck" component={GearCheckScreen} />
        <Stack.Screen name="DivePlan" component={DivePlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}