# Align Aesthetic

#### A Social Media Color Palette Curation Tool
<img src="assets/chatclone-demo.png" alt="Image" height="600">


## About this Project

### Description/Motivation
**Align Aesthetic** is a full-stack web application that helps users curate a cohesive social media aesthetic by extracting and visualizing dominant color palettes from user-uploaded images. The application leverages OpenCV and KMeans clustering to analyze the colors from the images, enabling users to match new images with the dominant colors of their existing content.

**Video Demo:** ![video]

### How to Use
To run the application, follow these steps:
1. Clone this repository
   ```sh
   git clone https://github.com/nmhumbe/AlignAesthetic
   ```
2. Install the required Python dependencies:
   ```sh
   pip install Flask opencv-python scikit-learn numpy
   ```
3. Start the Flask application
   ```sh
   python main.py
   ```
4. Access the application through your browser at:
   ```sh
   http://localhost:5000
   ```
5. Use the application to upload images, extract dominant color palettes, and match new images with your existing color theme.
   
<!-- ROADMAP -->

## Roadmap
- [X] Wrote Python code to extract dominant colors using KMeans clustering.
- [X] Implemented image upload and display functionality.
- [X] Converted Python script into a Flask application to extract and display dominant colors.
- [X] Matched images based on dominant color palettes.
- [ ] Add user authentication to save previous uploads and color palettes.
- [ ] Add mock social media feed display with recommened images.
- [ ] Integrate social media sharing features.


## Contributing
### Installation
1. Ensure you have Python 3.x installed.
2. Clone the repository:
   ```sh
   git clone https://github.com/nmhumbe/AlignAesthetic
   ```
3. Install the dependencies:
   ```sh
   pip install Flask opencv-python scikit-learn numpy
   ```

### Guidelines
Contributions are **welcome!** Feel free to fork the repository and submit a pull request. If you find any issues or have ideas for improvements, feel free to open an issue with the tag "enhancement."

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request
   

<!-- LICENSE -->
## License
Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->
## Contact

Neha Humbe - nehahumbe@ucla.edu

Project Link: https://github.com/nmhumbe/AlignAesthetic


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
* [README Template](https://github.com/othneildrew/Best-README-Template)
  
