import React, { useState } from 'react';
import { View, Button, Text, Vibration } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const GearCheckScreen = () => {
  const [result, setResult] = useState('');
  const API_TOKEN = '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'; // Hardcoded Hugging Face token
  const MODEL_ID = 'lmms-lab/LLaVA-OneVision-1.5-8B-Instruct'; // LLaVA-OneVision model

  const checkGear = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permissions are required to check gear.');
        return;
      }

      // Launch camera
      const image = await ImagePicker.launchCameraAsync({ base64: true });
      if (image.canceled) {
        setResult('Photo capture canceled.');
        return;
      }

      const base64Image = `data:image/jpeg;base64,${image.assets[0].base64}`;
      const prompt = "Examine this scuba diving gear photo (tank, regulator, etc.). Provide a detailed description, focusing on any visible issues such as damage, low air gauge readings, or leaks.";

      // Call Hugging Face Inference API
      const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt, image: base64Image }),
      });

      // Check HTTP status
      if (!response.ok) {
        const errorText = await response.text();
        setResult(`API Error: HTTP ${response.status} - ${errorText}`);
        alert(`API request failed (Status ${response.status}). Try again later.`);
        console.log('Raw error:', errorText);
        return;
      }

      const data = await response.json();
      if (data.error) {
        setResult(`API Error: ${data.error}`);
        alert('API error: Check token or model availability.');
        console.log('API response:', JSON.stringify(data));
        return;
      }

      // Parse response
      let description = 'No response received from AI.';
      if (Array.isArray(data)) {
        description = data[0]?.generated_text || data[0]?.text || 'No valid response';
      } else if (data.generated_text) {
        description = data.generated_text;
      } else {
        description = JSON.stringify(data); // Debug fallback
        console.log('Unexpected response format:', JSON.stringify(data));
      }
      setResult(description);

      // Check for issues
      const issues = ['damage', 'low', 'leak', 'broken', 'crack'];
      if (issues.some(issue => description.toLowerCase().includes(issue))) {
        Vibration.vibrate([0, 500, 200, 500]);
        alert('Issue detected in gear! Check description for details.');
      } else {
        alert('Gear appears to be in good condition.');
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
      alert('Failed to analyze gear photo. Check your internet or try again.');
      console.log('Error details:', error);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <Button title="Check Gear with AI" onPress={checkGear} />
      <Text style={{ marginTop: 10, fontSize: 16, maxWidth: '90%' }}>{result}</Text>
    </View>
  );
};

export default GearCheckScreen;