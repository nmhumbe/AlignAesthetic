// Handle image preview for multiple files
document.getElementById('fileInput').addEventListener('change', function (event) {
    let files = event.target.files;
    let previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = ''; // Clear previous preview

    // Loop through all selected files and create preview
    Array.from(files).forEach(file => {
        let reader = new FileReader();
        reader.onload = function (e) {
            let previewImage = new Image();
            previewImage.src = e.target.result;
            previewImage.style.maxWidth = '100%'; // Optional styling
            previewContainer.appendChild(previewImage);
        };
        reader.readAsDataURL(file);
    });
});

// Handle form submission for extracting dominant colors
document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    let formData = new FormData();
    let fileInput = document.getElementById('fileInput').files;

    // Append all selected files to the form data
    Array.from(fileInput).forEach(file => {
        formData.append('files[]', file);
    });

    // Fetch the dominant colors from the server
    let response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    let result = await response.json();

    // Display the dominant colors as colored blocks
    let colorBlocks = document.getElementById('colorBlocks');
    colorBlocks.innerHTML = ''; // Clear previous colors

    result.dominant_colors.forEach(color => {
        let colorBlock = document.createElement('div');
        colorBlock.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        colorBlock.style.width = '100px';
        colorBlock.style.height = '100px';
        colorBlock.style.display = 'inline-block';
        colorBlocks.appendChild(colorBlock);
    });
});

// Match and find the closest image to the extracted dominant colors
document.getElementById('matchForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    let formData = new FormData();
    let fileInput = document.getElementById('matchFileInput').files;

    // Append all selected images for matching
    Array.from(fileInput).forEach(file => {
        formData.append('files[]', file);
    });

    // Fetch the dominant colors from the previous step
    let dominantColors = [...document.getElementById('colorBlocks').children].map(block => {
        let rgb = window.getComputedStyle(block).backgroundColor;
        return rgb.match(/\d+/g).map(Number);  // Extract the RGB values as numbers
    });

    // Append dominant colors as JSON in the FormData
    formData.append('target_colors', JSON.stringify(dominantColors));

    try {
        let matchResponse = await fetch('/match', {
            method: 'POST',
            body: formData
        });

        let result = await matchResponse.json();

        // Debug: Log the result and check if the closest image is present
        console.log('Match result:', result);

        if (result.closest_image) {
            console.log('Received image:', result.closest_image);

            let matchedImage = new Image();
            matchedImage.src = 'data:image/png;base64,' + result.closest_image;
            matchedImage.style.maxWidth = '100%';

            document.getElementById('result').innerHTML = ''; // Clear previous result
            document.getElementById('result').appendChild(matchedImage);
        } else {
            console.log('No image returned:', result);
        }
    } catch (error) {
        console.error('Error fetching match result:', error);
    }
});
