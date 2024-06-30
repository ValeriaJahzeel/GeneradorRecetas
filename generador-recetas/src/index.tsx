import { HfInference } from "@huggingface/inference";
import { promises as fs } from 'fs';
import { Blob } from 'node:buffer';

const apiKey: string = "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";
const hf: HfInference = new HfInference(apiKey);

const imagePath: string = "img/aaa.jpg"; // Cambia esto por la ruta a tu imagen local
const model: string = "jazzmacedo/fruits-and-vegetables-detector-36";

// Define el tipo de resultado esperado
interface ClassificationResult {
  label: string;
  score: number;
}

const fetchImage = async (path: string): Promise<Blob> => {
  try {
    const imageBuffer: Buffer = await fs.readFile(path);
    return new Blob([imageBuffer], { type: 'image/jpeg' }); // Asegúrate de especificar el tipo MIME correcto
  } catch (error) {
    console.error('Error al leer la imagen:', error);
    throw error;
  }
};

const classifyImage = async (blob: Blob, model: string): Promise<ClassificationResult[]> => {
  try {
    const result: ClassificationResult[] = await hf.imageClassification({
      data: blob,
      model: model
    });
    return result;
  } catch (error) {
    console.error('Error al clasificar la imagen:', error);
    throw error;
  }
};

const main = async (): Promise<void> => {
  try {
    const imageBlob: Blob = await fetchImage(imagePath);
    const result = await classifyImage(imageBlob, model);
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
