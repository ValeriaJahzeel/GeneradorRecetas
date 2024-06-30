import { HfInference } from "@huggingface/inference";
import fs from "fs";
import { Blob } from "buffer"; 

const hf = new HfInference("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");

const imageURL = "salida/121.jpg"; 

async function getImageBlob(imagePath: fs.PathOrFileDescriptor) {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(new Blob([data]));
      }
    });
  });
}

async function classifyImage() {
  try {
    const blob = await getImageBlob(imageURL);
    const model = "jazzmacedo/fruits-and-vegetables-detector-36";
    
    const result = await hf.imageClassification({
      data: blob,
      model: model,
    });

    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

classifyImage();
