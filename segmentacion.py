import cv2
import numpy as np
import os
import shutil
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import requests
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware
import torchvision.transforms as transforms


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las fuentes. Puedes restringirlo a las que necesites.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_API_KEY = "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"
MODEL = "jazzmacedo/fruits-and-vegetables-detector-36"
API_URL = "https://api-inference.huggingface.co/models/jazzmacedo/fruits-and-vegetables-detector-36"

OUTPUT_DIR = 'generador-recetas/salida'

@app.get("/")
async def root():
    return {"message": "API funcionando."}

@app.post("/recorte")
async def recorte(imagen: UploadFile = File(...)):
    ##### print("Recibida solicitud de recorte.")
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
        ##### print(f"Directorio {OUTPUT_DIR} eliminado.")
    os.makedirs(OUTPUT_DIR)
    ##### print(f"Directorio {OUTPUT_DIR} creado.")

    if imagen:
        try:
            ##### print("Leyendo la imagen.")
            # Leer y decodificar la imagen usando OpenCV
            image = cv2.imdecode(np.frombuffer(await imagen.read(), np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                ##### print("Error: No se pudo cargar la imagen.")
                return JSONResponse(status_code=400, content={"error": "No se pudo cargar la imagen."})
            
            ##### print("Imagen leída correctamente.")
            # Convertir la imagen a escala de grises y aplicar desenfoque
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            ##### print("Contornos detectados.")

            results = []
            headers = {"Authorization": f"Bearer {HF_API_KEY}"}

            # Iterar sobre los contornos detectados
            for i, contour in enumerate(contours):
                x, y, w, h = cv2.boundingRect(contour)
                # Filtrar contornos demasiado pequeños
                if w < 50 or h < 50:
                    continue

                ##### print(f"Procesando contorno {i}: posición ({x}, {y}), tamaño ({w}x{h}).")
                # Recortar la imagen
                crop_img = image[y:y+h, x:x+w]
                output_path = os.path.join(OUTPUT_DIR, f'{i}.jpg')
                cv2.imwrite(output_path, crop_img)
                ##### print(f"Recorte guardado en {output_path}.")

                # _, buffer = cv2.imencode('.jpg', crop_img)
                # img_byte_arr = io.BytesIO(buffer).getvalue()
                # img_byte_arr = buffer.numpy().tobytes()


                # img_encode = cv2.imencode('.jpg', crop_img)[1]
                # data_encode = np.array(img_encode) 
                # byte_encode = data_encode.tobytes() 

                # preprocess = transforms.Compose([
                #     transforms.Resize((224, 224)),
                #     transforms.ToTensor(),
                #     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                # ])

                # image = cv2.cvtColor(crop_img, cv2.COLOR_BGR2RGB)
                # pil_image = Image.fromarray(image)  # Convert NumPy array to PIL image
                # input_tensor = preprocess(pil_image).unsqueeze(0)
                # # Convert input_tensor to bytes-like format
                # input_tensor_bytes = input_tensor.numpy().tobytes()

                def query(filename):
                    with open(filename, "rb") as f:
                        data = f.read()
                    response = requests.post(API_URL, headers=headers, data=data)
                    return response.json()

                # Hacer una llamada a la API de Hugging Face
                # response = requests.post(
                #     f"https://api-inference.huggingface.co/models/{MODEL}",
                #     headers=headers,
                #     files={"file": byte_encode},
                # )

                # response = HF_API_KEY.imageClassification({
                #     data: crop_img,
                #     model: 'jazzmacedo/fruits-and-vegetables-detector-36'
                # })

                response = query(output_path)
                ##### print(f"A ver que vaina es esto: {query(output_path)} xd")


                if response:
                    predictions = query(output_path)
                    if predictions:
                        # Añadir la ruta de la imagen a las predicciones
                        predictions[0]['image_path'] = output_path
                        results.append(predictions[0])
                        ##### print(f"Predicción para recorte {i}: {predictions[0]}")
                else:
                    error_message = response.json().get("error", "Sin mensaje de error.")
                    ##### print(f"Error al obtener predicciones para el recorte {i}: {response.status_code} - {error_message}")

            ##### print("Procesamiento de imagen completado.")
            return JSONResponse(status_code=200, content=results)
        except Exception as e:
            ##### print(f"Error al procesar la imagen: {str(e)}")
            return JSONResponse(status_code=500, content={"error": f"Error al procesar la imagen: {str(e)}"})
    else:
        ##### print("No se subió ninguna imagen.")
        return JSONResponse(status_code=400, content={"error": "No se subió ninguna imagen."})
