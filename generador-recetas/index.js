import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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")

const imageURL = "https://imgmedia.buenazo.pe/650x358/buenazo/original/2022/02/01/61f971e90de24b35ca157a99.jpg"

const model = "jazzmacedo/fruits-and-vegetables-detector-36"

const response = await fetch(imageURL)
const blob = await response.blob()

const result = await hf.imageClassification({
  data: blob,
  model: model
})

console.log(result)
