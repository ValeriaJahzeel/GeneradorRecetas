import { HfInference } from "@huggingface/inference";

// Función principal
async function detectObjects() {
  const hf = new HfInference("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");

  const imageURL = "https://animalgourmet.com/wp-content/uploads/2020/06/verduras-mas-saludables-9-e1591182976341.jpg";
  const model = "facebook/detr-resnet-101";

  try {
    const response = await fetch(imageURL);
    const blob = await response.blob();

    const result = await hf.objectDetection({
      data: blob,
      model: model
    });

    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Llamar a la función
detectObjects();
