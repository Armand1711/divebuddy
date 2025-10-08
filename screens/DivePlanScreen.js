import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://uhumoqjzxmyalobudnyq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodW1vcWp6eG15YWxvYnVkbnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzk5MzIsImV4cCI6MjA3NTQ1NTkzMn0.rka_kW87u-PvQl2R9htMc3A8GallHzImVgX8U-LXT9E');

const DivePlanScreen = () => {
  const [depth, setDepth] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const savePlan = async () => {
    // Validate inputs
    if (!depth || !duration) {
      Alert.alert('Error', 'Please enter depth and duration.');
      return;
    }

    const { error } = await supabase.from('diveplans').insert({
      userID: 'USER_ID', // Replace with authenticated user ID later
      depth: parseFloat(depth),
      duration: parseInt(duration),
      notes,
      created_at: new Date().toISOString()
    });
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success', 'Dive plan saved!');
      setDepth(''); setDuration(''); setNotes(''); // Clear fields
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Depth (meters)"
        value={depth}
        onChangeText={setDepth}
        keyboardType="numeric"
        style={{ borderWidth: 1, margin: 5, padding: 5 }}
      />
      <TextInput
        placeholder="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={{ borderWidth: 1, margin: 5, padding: 5 }}
      />
      <TextInput
        placeholder="Notes (e.g., site, conditions)"
        value={notes}
        onChangeText={setNotes}
        style={{ borderWidth: 1, margin: 5, padding: 5 }}
      />
      <Button title="Save Dive Plan" onPress={savePlan} />
    </View>
  );
};

export default DivePlanScreen;