import cv2
import numpy as np
import os

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data(image_path):
    output_dir = '../salida'

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    image = cv2.imread(image_path)

    if image is None:
        print(f"No se pudo cargar la imagen.")
    else:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY_INV)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for i, contour in enumerate(contours):
            x, y, w, h = cv2.boundingRect(contour)
        
            if(w < 50 or h < 50):
                continue
        
            crop_img = image[y:y+h, x:x+w]

            output_path = os.path.join(output_dir, f'{i}.jpg')

            cv2.imwrite(output_path, crop_img)

        print("Imagenes guardados")
    

if __name__ == '__main__':
    app.run(debug=True)


