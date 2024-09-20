// Handle image preview for multiple files (for extracting dominant colors)
document.getElementById('fileInput').addEventListener('change', function (event) {
    let files = event.target.files;
    let previewContainer = document.getElementById('preview');
    
    // Clear previous images
    previewContainer.querySelectorAll('img').forEach(img => img.remove());

    // Check if files are uploaded
    if (files.length > 0) {
        // Show the image preview title
        document.querySelector('#preview h3').style.display = 'block';
    }

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

// Handle image preview for the second file input (for matching closest image)
document.getElementById('matchFileInput').addEventListener('change', function (event) {
    let files = event.target.files;
    let matchPreviewContainer = document.getElementById('matchPreview');

    // Clear previous images
    matchPreviewContainer.querySelectorAll('img').forEach(img => img.remove());
    
    if (files.length > 0) {
        // Show the image preview title
        document.querySelector('#matchPreview h3').style.display = 'block';
    }

    // Loop through all selected files and create preview
    Array.from(files).forEach(file => {
        let reader = new FileReader();
        reader.onload = function (e) {
            let previewImage = new Image();
            previewImage.src = e.target.result;
            previewImage.style.maxWidth = '100%'; // Optional styling
            matchPreviewContainer.appendChild(previewImage);
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
        formData.append('filesArray', file);
    });

    // Fetch the dominant colors from the server
    let response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    let result = await response.json();

    // Display dominant colors as colored blocks
    let colorBlocks = document.getElementById('colorBlocks');
    colorBlocks.innerHTML = ''; // Clear previous colors

    // Clear previous colors and display title
    let colorBlocksContainer = document.getElementById('colorBlocks');
    colorBlocksContainer.innerHTML = '<h3>Dominant Colors:</h3>'; // Set title


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
        formData.append('filesArray', file);
    });

    // Fetch dominant colors from the previous step
    let dominantColors = [...document.getElementById('colorBlocks').querySelectorAll('div')].map(block => {
        let rgb = window.getComputedStyle(block).backgroundColor;
        return rgb.match(/\d+/g).map(Number);  // Extract the RGB values as numbers
    });

    // Log dominant colors
    console.log("Dominant colors extracted:", dominantColors);

    // Append dominant colors as JSON in the FormData
    formData.append('target_colors', JSON.stringify(dominantColors));

    try {
        // Log the FormData before sending
        for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }

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

        // Keep the title and just add the matched image below it
        document.getElementById('result').innerHTML = '<h3>Closest Matching Image:</h3>'; // Keep the title
        document.getElementById('result').appendChild(matchedImage);

        
        } else {
            console.log('No image returned:', result);
        }
    } catch (error) {
        console.error('Error fetching match result:', error);
    }
});

