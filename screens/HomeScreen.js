import React from 'react';
import { View, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Button title="Check Gear" onPress={() => navigation.navigate('GearCheck')} />
      <Button title="Plan Dive" onPress={() => navigation.navigate('DivePlan')} />
    </View>
  );
};

export default HomeScreen;