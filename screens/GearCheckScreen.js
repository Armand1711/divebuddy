import React, { useState } from 'react';
import { View, Button, Text, Vibration, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

const HF_API_TOKEN =
  Constants.expoConfig?.extra?.HF_API_TOKEN ||
  Constants.manifest?.extra?.HF_API_TOKEN ||
  process.env.HF_API_TOKEN ||
  '';

const MODEL_ID = 'prithivMLmods/Multimodal-VLM-v1.0';

const GearCheckScreen = () => {
  const [result, setResult] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkGear = async () => {
    try {
      if (!HF_API_TOKEN) {
        Alert.alert('Missing API token', 'HF_API_TOKEN is not configured in app.json extras.');
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required to take a photo.');
        return;
      }

      const image = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.8,
      });

      // Handle user cancel
      if (image.cancelled || image.canceled) {
        setResult('Photo capture canceled.');
        setImageUri(null);
        return;
      }

      // New ImagePicker returns assets array
      const asset = image.assets ? image.assets[0] : image;
      if (!asset || (!asset.uri && !asset.base64)) {
        setResult('No image captured.');
        return;
      }

      setImageUri(asset.uri || null);
      const base64Image = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null;

      const prompt =
        'Analyze this scuba diving gear photo (tank, regulator, etc.). Provide a detailed description, focusing on any visible issues such as damage, low air gauge readings, or leaks. Highlight safety concerns.';

      setLoading(true);
      setResult('');

      const body = {
        inputs: prompt,
        // Some HF multimodal endpoints accept {"image": "<data-url>"} alongside inputs.
        // Keep both in case model expects image field.
        image: base64Image,
      };

      const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      setLoading(false);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`API Error: HTTP ${response.status} - ${errorText}`);
        Alert.alert('API Error', `Request failed (status ${response.status}).`);
        console.log('Raw error:', errorText);
        return;
      }

      const data = await response.json();
      if (data.error) {
        setResult(`API Error: ${data.error}`);
        Alert.alert('API Error', 'Check token or model availability.');
        console.log('API response error:', JSON.stringify(data));
        return;
      }

      let description = 'No response from model.';
      if (Array.isArray(data) && data.length > 0) {
        description = data[0]?.generated_text || data[0]?.text || JSON.stringify(data[0]);
      } else if (typeof data === 'object') {
        description = data.generated_text || data.text || JSON.stringify(data);
      } else {
        description = String(data);
      }

      setResult(description);

      const issues = ['damage', 'low', 'leak', 'broken', 'crack', 'leaking'];
      if (issues.some((issue) => description.toLowerCase().includes(issue))) {
        Vibration.vibrate(500);
        Alert.alert('Issue detected', 'The AI detected a potential issue in the gear. See description.');
      } else {
        Alert.alert('OK', 'Gear appears to be in good condition.');
      }
    } catch (error) {
      setLoading(false);
      setResult(`Error: ${error.message}`);
      Alert.alert('Error', 'Failed to analyze gear photo.');
      console.log('Error details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Check Gear with AI" onPress={checkGear} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} size="large" />}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
      ) : null}
      <Text style={styles.resultText}>{result}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  preview: {
    width: '90%',
    height: 300,
    marginVertical: 10,
    borderRadius: 10,
  },
  resultText: {
    marginTop: 10,
    fontSize: 16,
    maxWidth: '90%',
    textAlign: 'center',
  },
});

export default GearCheckScreen;