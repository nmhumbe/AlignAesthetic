from flask import Flask, request, render_template, jsonify
import cv2
import numpy as np
from sklearn.cluster import KMeans
import imutils
from io import BytesIO
import base64
import json

app = Flask(__name__)

# Function to get the dominant colors of an image
def get_dominant_colors(img, clusters=4):
    img = imutils.resize(img, height=200)
    flat_img = np.reshape(img, (-1, 3))  # Flatten the image

    # Perform KMeans Clustering
    kmeans = KMeans(n_clusters=clusters, random_state=0)
    kmeans.fit(flat_img)

    # Get the dominant colors
    dominant_colors = np.array(kmeans.cluster_centers_, dtype='uint')
    return dominant_colors

# Function to calculate the color difference between two colors
def color_difference(color1, color2):
    return np.linalg.norm(np.array(color1) - np.array(color2))

# Function to find the image closest to the given colors
def find_closest_image(images, target_colors, clusters=4):
    closest_img = None
    min_diff = float('inf')

    for img in images:
        img_colors = get_dominant_colors(img, clusters)
        # Compare the average difference between the target colors and the image's colors
        diff = sum([min([color_difference(c1, c2) for c2 in img_colors]) for c1 in target_colors])
        if diff < min_diff:
            min_diff = diff
            closest_img = img

    return closest_img

# Route for rendering the frontend page
@app.route('/')
def index():
    return render_template('index.html')

# Route for uploading and processing multiple images to extract dominant colors
@app.route('/upload', methods=['POST'])
def upload_images():
    # Get all uploaded files
    files = request.files.getlist('files[]')

    # Store images for color extraction
    images = []
    
    for file in files:
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        images.append(img)

    # Combine dominant colors from all uploaded images
    all_colors = []
    for img in images:
        dominant_colors = get_dominant_colors(img)
        all_colors.extend(dominant_colors)

    # Perform KMeans again to extract the top 4 colors from all images combined
    flat_colors = np.reshape(all_colors, (-1, 3))
    kmeans = KMeans(n_clusters=4, random_state=0)
    kmeans.fit(flat_colors)

    # Get the top 4 dominant colors
    combined_colors = np.array(kmeans.cluster_centers_, dtype='uint')

    # Return the combined dominant colors as a list of RGB values
    return jsonify({'dominant_colors': combined_colors.tolist()})

# Route for uploading a different set of images and finding the closest match to the given colors
@app.route('/match', methods=['POST'])
def match_image():
    try:
        # Log the raw incoming request content type
        print("Incoming request content type:", request.content_type)

        # Extract the 'target_colors' from the form data (sent as a JSON string)
        target_colors_str = request.form.get('target_colors')
        if not target_colors_str:
            return jsonify({'error': 'No target colors found in the request'}), 400

        # Convert the JSON string of target colors back into a Python list
        target_colors = json.loads(target_colors_str)
        print("Target colors:", target_colors)

        # Extract the uploaded files (images)
        files = request.files.getlist('files[]')
        print("Number of files received:", len(files))

        if not files:
            return jsonify({'error': 'No images uploaded'}), 400

        # Convert target colors to a numpy array
        target_colors = np.array(target_colors, dtype='uint')

        # Store images for comparison
        images = []
        for file in files:
            file_bytes = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            images.append(img)

        # Find the image that matches the target colors the closest
        closest_img = find_closest_image(images, target_colors)

        if closest_img is None:
            print("No matching image found")
            return jsonify({'error': 'No matching image found'}), 400

        # Convert the closest image to base64 to return
        success, image_encoded = cv2.imencode('.png', closest_img)
        if not success:
            print("Failed to encode image")
            return jsonify({'error': 'Image encoding failed'}), 500

        img_bytes = base64.b64encode(image_encoded).decode('utf-8')
        print("Returning image in base64 format.")

        return jsonify({'closest_image': img_bytes})

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'An error occurred', 'message': str(e)}), 500


@app.route('/match/colors', methods=['POST'])
def match_colors():
    try:
        global uploaded_images
        if not uploaded_images:
            return jsonify({'error': 'No uploaded images available for matching'}), 400

        target_colors = request.json['target_colors']
        if not target_colors:
            return jsonify({'error': 'No target colors found'}), 400

        target_colors = np.array(target_colors, dtype='uint')
        print("Target colors received:", target_colors)

        # Find the image that matches the target colors the closest
        closest_img = find_closest_image(uploaded_images, target_colors)

        if closest_img is None:
            print("No matching image found")
            return jsonify({'error': 'No matching image found'}), 400

        # Print shape and type of image selected
        print("Closest image found:", type(closest_img), closest_img.shape)

        # Convert the closest image to base64 to return
        success, image_encoded = cv2.imencode('.png', closest_img)

        if not success:
            print("Failed to encode image")
            return jsonify({'error': 'Image encoding failed'}), 500

        img_bytes = base64.b64encode(image_encoded).decode('utf-8')

        # Debug: Print the first few characters of the base64 encoded image
        print("Encoded image (base64, first 100 chars):", img_bytes[:100])

        return jsonify({'closest_image': img_bytes})

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'An error occurred', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
