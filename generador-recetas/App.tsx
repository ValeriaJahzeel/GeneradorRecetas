import { HfInference } from "@huggingface/inference";

const apiKey: string = "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";
const hf: HfInference = new HfInference(apiKey);

const imageURL: string = "https://imgmedia.buenazo.pe/650x358/buenazo/original/2022/02/01/61f971e90de24b35ca157a99.jpg";

const model: string = "jazzmacedo/fruits-and-vegetables-detector-36";

const fetchImage = async (url: string): Promise<Blob> => {
  const response: Response = await fetch(url);
  return await response.blob();
};

const classifyImage = async (blob: Blob, model: string) => {
  const result = await hf.imageClassification({
    data: blob,
    model: model
  });
  return result;
};

const main = async () => {
  try {
    const imageBlob: Blob = await fetchImage(imageURL);
    const result = await classifyImage(imageBlob, model);
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
