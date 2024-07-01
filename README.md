# GeneradorRecetas

Esta app te permite tomar una foto desde tu teléfono o subir una foto desde tu galeria
de frutas y/o verduras, lo que obtienes de salida es una receta de lo que podrías 
hacer con esos ingredientes.

Utiliza la API de Hugging Face jazzmacedo/fruits-and-vegetables-detector-36 así que 
tiene un alcance limitado en cuanto a las frutas y verduras que puede detectar.

Utiliza una API de fastAPI que permite recortar los objetos de la imagen de entrada en 
y de esta manera pasarlos al modelo. Para ejecutarlo debes tener instalado uvicorn y fastAPI, 
luego, desde la terminal escribe
uvicorn segmentacion:app --host 0.0.0.0 --port 8000 --reload

Para ejecutar la app de react native, dirigete a la carpeta del proyecto y ejecuta npx expo start