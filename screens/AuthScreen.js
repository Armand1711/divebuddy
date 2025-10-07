import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://uhumoqjzxmyalobudnyq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodW1vcWp6eG15YWxvYnVkbnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzk5MzIsImV4cCI6MjA3NTQ1NTkzMn0.rka_kW87u-PvQl2R9htMc3A8GallHzImVgX8U-LXT9E');

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    const { error, data } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error', error.message);
    else if (data?.user) navigation.replace('Home'); // Home not built yet
    else Alert.alert('Success', 'Check email for confirmation (signup)');
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />
      <Button title={isLogin ? 'Switch to Sign Up' : 'Switch to Login'} onPress={() => setIsLogin(!isLogin)} />
    </View>
  );
};

export default AuthScreen;