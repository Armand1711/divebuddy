import React, { useState } from 'react';
import { View, Button, Text, Vibration } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const GearCheckScreen = () => {
  const [result, setResult] = useState('');
  const API_TOKEN = 'Token'; // Ask Armand to help get API token
  const MODEL_ID = 'ModelId'; // Ask Armand to help get model ID

  const checkGear = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Need camera permissions!');
      return;
    }

    const image = await ImagePicker.launchCameraAsync({ base64: true });
    if (image.canceled) return;

    const base64Image = `data:image/jpeg;base64,${image.assets[0].base64}`;

    // Prompt for scuba gear analysis
    const prompt = "Analyze this scuba diving gear photo. Describe the tank, regulator, and any visible issues like damage, low air gauge, or leaks. Be specific.";

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, image: base64Image }),
    });

    const data = await response.json();
    if (!data || data.error) {
      setResult('Error: ' + (data.error || 'API failed'));
      return;
    }

    // Parse response 
    const description = Array.isArray(data) ? data[0].generated_text : data[0]?.generated_text || 'No response';
    setResult(description);

    // Check for issues in response
    const issues = ['damage', 'low', 'leak', 'broken', 'crack'];
    if (issues.some(issue => description.toLowerCase().includes(issue))) {
      Vibration.vibrate([0, 500, 200, 500]);
      alert('Issue detected in gear! Check description.');
    } else {
      alert('Gear looks good based on analysis.');
    }
  };

  return (
    <View>
      <Button title="Check Gear with AI" onPress={checkGear} />
      <Text style={{ marginTop: 10 }}>{result}</Text>
    </View>
  );
};

export default GearCheckScreen;