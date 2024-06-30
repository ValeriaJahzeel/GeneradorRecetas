import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, ActivityIndicator, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const App: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Necesitamos permisos de galería para que la app funcione!!!');
        return;
      }
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        alert('Necesitamos permisos de cámara para que la app funcione!!!');
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      classifyImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      classifyImage(result.assets[0].uri);
    }
  };

  const classifyImage = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('imagen', {
        uri: uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // no se si esta URL está bien (la de abajo) puede ser que cambie a 127.0.0.1:80000
      const response = await fetch('http://192.168.1.67:8000/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Selecciona una imagen de la galería" onPress={pickImage} />
      <Button title="Toma una foto" onPress={takePhoto} />
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <ScrollView>
              {result && result.map((prediction: any, index: number) => (
                <View key={index} style={{ margin: 10 }}>
                  <Text>Prediction: {prediction.label}</Text>
                  <Text>Score: {prediction.score}</Text>
                  <Image source={{ uri: `file://${prediction.image_path}` }} style={{ width: 100, height: 100 }} />
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};

export default App;
