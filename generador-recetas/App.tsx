import React, { useState } from 'react';
import { View, Button, Image, Text, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference("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");
const model = 'jazzmacedo/fruits-and-vegetables-detector-36';

const App: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {
    // Pide permiso para acceder a la galería de imágenes
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    // Abre la galería de imágenes
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

  const classifyImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const result = await hf.imageClassification({
        data: blob,
        model: model,
      });

      setResult(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Select Image" onPress={pickImage} />
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
          <Text>Result: {JSON.stringify(result, null, 2)}</Text>
        </>
      )}
    </View>
  );
};

export default App;
