import cv2
import numpy as np
import os
import shutil
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import requests
from PIL import Image
import io

app = FastAPI()

HF_API_KEY = "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"
MODEL = "jazzmacedo/fruits-and-vegetables-detector-36"
OUTPUT_DIR = 'generador-recetas/salida'

@app.post("/")
async def recorte(imagen: UploadFile = File(...)):
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)

    if imagen:
        try:
            image = cv2.imdecode(np.frombuffer(await imagen.read(), np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                return JSONResponse(status_code=400, content={"error": "No se pudo cargar la imagen."})
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            results = []
            headers = {"Authorization": f"Bearer {HF_API_KEY}"}

            for i, contour in enumerate(contours):
                x, y, w, h = cv2.boundingRect(contour)
                if w < 50 or h < 50:
                    continue

                crop_img = image[y:y+h, x:x+w]
                output_path = os.path.join(OUTPUT_DIR, f'{i}.jpg')
                cv2.imwrite(output_path, crop_img)

                _, buffer = cv2.imencode('.jpg', crop_img)
                img_byte_arr = io.BytesIO(buffer).getvalue()

                response = requests.post(
                    f"https://api-inference.huggingface.co/models/{MODEL}",
                    headers=headers,
                    files={"file": img_byte_arr},
                )

                if response.ok:
                    predictions = response.json()
                    if predictions:
                        predictions[0]['image_path'] = output_path 
                        results.append(predictions[0])

            return JSONResponse(status_code=200, content=results)
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Error al procesar la imagen: {str(e)}"})
    else:
        return JSONResponse(status_code=400, content={"error": "No se subió ninguna imagen."})


