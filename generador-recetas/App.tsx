import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, ActivityIndicator, Platform, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const App: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string>('');

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

      // URL de la API
      const response = await fetch('http://192.168.1.68:8000/recorte', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      setResult(result);
      console.log('Result from API:', result);

      // Extraer etiquetas y obtener receta
      if (result) {
        const labels = result?.map((prediction: any) => prediction.label).join(', ');
        query({ "inputs": labels }).then((response) => {
          const recipeText = response[0]?.generated_text || 'No se pudo generar una receta.';
          setGeneratedText(recipeText);
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // Huggingface API RECETAS
  async function query(data: any) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/flax-community/t5-recipe-generation",
      {
        headers: { Authorization: "Bearer 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" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Generador de recetas</Text>
      <Button title="Selecciona una imagen de la galería" onPress={pickImage} />
      <Button title="Toma una foto" onPress={takePhoto} />
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
          ) : (
            <ScrollView style={styles.scrollView}>
              {result ? (
                result.map((prediction: any, index: number) => (
                  <View key={index} style={styles.predictionContainer}>
                    <Text style={styles.predictionText}>Ingrediente: {prediction.label}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noResultText}>No se encontraron ingredientes</Text>
              )}
              <Text style={styles.generatedText}>{generatedText}</Text>
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  image: {
    height: 200,
    width: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  scrollView: {
    width: '100%',
  },
  predictionContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  predictionText: {
    fontSize: 16,
    color: '#333',
  },
  noResultText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  generatedText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default App;
