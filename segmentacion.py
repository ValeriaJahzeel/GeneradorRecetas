import cv2
import numpy as np
import os
import shutil
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

app = FastAPI()
#http://127.0.0.1:8000

@app.post("/")
async def recorte(imagen: UploadFile = File(...)):
    output_dir = 'generador-recetas/salida'

    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    if imagen:
        try:
            image = cv2.imdecode(np.frombuffer(await imagen.read(), np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                return JSONResponse(status_code=400, content={"error": "No se pudo cargar la imagen."})
            else:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                blurred = cv2.GaussianBlur(gray, (5, 5), 0)
                _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY_INV)
                contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                for i, contour in enumerate(contours):
                    x, y, w, h = cv2.boundingRect(contour)
                    if w < 50 or h < 50:
                        continue

                    crop_img = image[y:y+h, x:x+w]
                    output_path = os.path.join(output_dir, f'{i}.jpg')
                    cv2.imwrite(output_path, crop_img)

                return JSONResponse(status_code=200, content={"message": "Imágenes guardadas exitosamente."})
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Error al procesar la imagen: {str(e)}"})
    else:
        return JSONResponse(status_code=400, content={"error": "No se proporcionó ninguna imagen."})
