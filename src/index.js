// Get DOM elements
const fileInput = document.querySelector("#upload");
const sizeElement = document.querySelector("#sizeRange");
const colorElements = document.getElementsByName("colorRadio");
const canvasElement = document.getElementById("canvas");
const clearElement = document.getElementById("clear");
const saveImg = document.querySelector(".save-img");
const saveImgOri = document.querySelector(".save-img-ori");
const saveImgBinary = document.querySelector(".save-img-binary");
const sendPicWish = document.querySelector(".send-picwish");

// Initialize variables
let originalImage = null;
let size = sizeElement.value;
let color;

// Function to convert file to Data URI
async function fileToDataUri(field) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        reader.readAsDataURL(field);
    });
}

// Function to draw on Canvas
function drawOnImage(image = null) {
    const context = canvasElement.getContext("2d");

    if (image) {
        canvasElement.width = image.width;
        canvasElement.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
    }

    context.lineWidth = size;
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineCap = "round";

    canvasElement.onmousedown = (e) => {
        isDrawing = true;
        context.beginPath();
        context.moveTo(e.clientX, e.clientY);
    };

    canvasElement.onmousemove = (e) => {
        if (isDrawing) {
            context.lineTo(e.clientX, e.clientY);
            context.stroke();
        }
    };

    canvasElement.onmouseup = () => {
        isDrawing = false;
        context.closePath();
    };

    clearElement.onclick = () => {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    };
}

// Function to save Canvas image
function saveCanvasImage() {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvasElement.toDataURL();
    link.click();
}

// Event Listener for changing brush size
sizeElement.addEventListener("input", (e) => {
    size = e.target.value;
});

// Event Listeners for color selection
colorElements.forEach((c) => {
    if (c.checked) color = c.value;
});

colorElements.forEach((c) => {
    c.addEventListener("click", () => {
        color = c.value;
    });
});

// Event Listener for file input
fileInput.addEventListener("change", async (e) => {
    const [file] = fileInput.files;
    const image = document.createElement("img");
    image.src = await fileToDataUri(file);

    image.addEventListener("load", () => {
        originalImage = image;
        drawOnImage(image);
    });
});

// Event Listener for saving Canvas image
saveImg.addEventListener("click", saveCanvasImage);

// Event Listener for saving original image
saveImgOri.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;

    if (originalImage) {
        link.href = originalImage.src;
        link.click();
    } else {
        alert("Please Upload Image Before Downloading.");
    }
});

// Event Listener for saving binary mask image
saveImgBinary.addEventListener("click", () => {
    // Get the image data from the canvas
    const imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;

    // Define the RGB color to change to white
    const targetColor = [227, 7, 19];

    // Perform color transformation
    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        // Check color and change to white if it matches the target color
        if (red === targetColor[0] && green === targetColor[1] && blue === targetColor[2]) {
            data[i] = 255; // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
        } else {
            // Not the target color, change to black
            data[i] = 0; // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
        }
    }

    // Create Data URL and trigger download
    const link = document.createElement("a");
    link.download = `${Date.now()}_binary.jpg`;
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = canvasElement.width;
    tempCanvas.height = canvasElement.height;
    tempContext.putImageData(imageData, 0, 0);
    link.href = tempCanvas.toDataURL("image/jpeg");
    link.click();
});

// Event Listener for sending a picture wish
sendPicWish.addEventListener("click", async () => {
    // Define API URL and key
    const apiUrl = "https://techhk.aoscdn.com/api/tasks/visual/inpaint";
    const apiKey = "wx3fdwlu6wk6hjv8j";

    // Create a FormData object and append sync parameter
    const formData = new FormData();
    formData.append("sync", "1");

    // Check if originalImage is available
    if (originalImage) {
        // Create a canvas with the same dimensions as originalImage
        const canvas = document.createElement("canvas");
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const context = canvas.getContext("2d");
        context.drawImage(originalImage, 0, 0);

        // Convert canvas to a Blob and append it as a File to the formData
        canvas.toBlob(async (blob) => {
            const imageFile = new File([blob], "image.jpg");
            formData.append("image_file", imageFile);

            // Get the image data from the canvas (the modified binary mask)
            const imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
            const data = imageData.data;

            // Define the target RGB color to change to white
            const targetColor = [227, 7, 19];

            // Perform color transformation
            for (let i = 0; i < data.length; i += 4) {
                const red = data[i];
                const green = data[i + 1];
                const blue = data[i + 2];

                // Check color and change to white if it matches the target color
                if (red === targetColor[0] && green === targetColor[1] && blue === targetColor[2]) {
                    data[i] = 255; // R
                    data[i + 1] = 255; // G
                    data[i + 2] = 255; // B
                } else {
                    // Not the target color, change to black
                    data[i] = 0; // R
                    data[i + 1] = 0; // G
                    data[i + 2] = 0; // B
                }
            }

            // Create a new canvas for the modified binary mask
            
            const maskCanvas = document.createElement("canvas");
            const maskContext = maskCanvas.getContext("2d");
            maskCanvas.width = canvasElement.width;
            maskCanvas.height = canvasElement.height;
            maskContext.putImageData(imageData, 0, 0);
           

            // Convert the mask canvas to a Blob and append it as a File to the formData
            maskCanvas.toBlob((maskBlob) => {
                const maskFile = new File([maskBlob], "mask.jpg");
                console.log("mask : ",maskFile)
                formData.append("mask_file", maskFile);

                // Send the formData with both image and mask files to the API
                fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "X-API-KEY": apiKey,
                    },
                    body: formData,
                })
                    .then(function (response) {
                        if (response.ok) {
                            return response.text();
                        } else {
                            throw new Error("เกิดข้อผิดพลาดในการส่งรูปภาพ");
                        }
                    })
                    .then(function (data) {
                        console.log(data);
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            }, "image/jpeg");
        }, "image/jpeg");
    } else {
        alert("Please Upload Image Before Sending.");
    }
});

  


