// DOM elements
const fileInput = document.querySelector("#upload");
const sizeElement = document.querySelector("#sizeRange");
const colorElements = document.getElementsByName("colorRadio");
const canvasElement = document.getElementById("canvas");
const clearElement = document.getElementById("clear");
const saveImg = document.querySelector(".save-img");
const saveImgOri = document.querySelector(".save-img-ori");
const saveImgBinary = document.querySelector(".save-img-binary");
const sendPicWish = document.querySelector(".send-picwish");
let imageApi = null;

// Variables
let originalImage = null;
let size =  sizeElement.value;
let color = "rgba(227, 7, 19, 0.75)";

// Function to convert file to Data URI
async function fileToDataUri(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        reader.readAsDataURL(file);
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

    let isDrawing = false;

    canvasElement.addEventListener("mousedown", (e) => {
        isDrawing = true;
        context.beginPath();
        context.moveTo(e.clientX, e.clientY);
    });

    canvasElement.addEventListener("mousemove", (e) => {
        if (isDrawing) {
            context.lineTo(e.clientX, e.clientY);
            context.stroke();
        }
    });

    canvasElement.addEventListener("mouseup", () => {
        isDrawing = false;
        context.closePath();
    });

    clearElement.addEventListener("click", () => {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    });
}

// Function to save Canvas image
function saveCanvasImage() {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvasElement.toDataURL();
    link.click();
}

// Event Listeners
sizeElement.addEventListener("input", (e) => {
    const context = canvasElement.getContext("2d");
    size = e.target.value;
    context.lineWidth = size;
    console.log("size :", size)
});

colorElements.forEach((c) => {
    c.addEventListener("click", () => {
        color = c.value;
    });
});

fileInput.addEventListener("change", async (e) => {
    const [file] = fileInput.files;
    const image = document.createElement("img");
    image.src = await fileToDataUri(file);

    image.addEventListener("load", () => {
        originalImage = image;
        drawOnImage(image);
    });
});

saveImg.addEventListener("click", saveCanvasImage);

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

saveImgBinary.addEventListener("click", () => {
    const imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;

    const targetColor = [227, 7, 19];

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        if (red === targetColor[0] && green === targetColor[1] && blue === targetColor[2]) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }

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

sendPicWish.addEventListener("click", async () => {
    const apiUrl = "https://techhk.aoscdn.com/api/tasks/visual/inpaint"; 
    const apiKey = "wxl2fcluq9l4fu6so";

    const formData = new FormData();
    formData.append("sync", "1");

    if (originalImage || imageApi) {
        const sourceImage = imageApi ? imageApi : originalImage;

        const canvas = document.createElement("canvas");
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        const context = canvas.getContext("2d");
        context.drawImage(sourceImage, 0, 0);

        canvas.toBlob(async (blob) => {
            const imageFile = new File([blob], "image.jpg");
            formData.append("image_file", imageFile);

            const imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
            const data = imageData.data;

            const targetColor = [227, 7, 19];

            for (let i = 0; i < data.length; i += 4) {
                const red = data[i];
                const green = data[i + 1];
                const blue = data[i + 2];

                if (red === targetColor[0] && green === targetColor[1] && blue === targetColor[2]) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                } else {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
            }

            const maskCanvas = document.createElement("canvas");
            const maskContext = maskCanvas.getContext("2d");
            maskCanvas.width = canvasElement.width;
            maskCanvas.height = canvasElement.height;
            maskContext.putImageData(imageData, 0, 0);

            maskCanvas.toBlob((maskBlob) => {
                const maskFile = new File([maskBlob], "mask.jpg");
                formData.append("mask_file", maskFile);

                fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "X-API-KEY": apiKey,
                    },
                    body: formData,
                })
                    .then(function (response) {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error("An error occurred while sending the image.");
                        }
                    })
                    .then(function (data) {
                        console.log(data);

                        const imageUrl = data.data.image;

                        if (imageUrl) {
                            console.log("Processing...")
                            const img = new Image();
                            img.crossOrigin = "Anonymous";
                            img.onload = function () {
                                const context = canvasElement.getContext("2d");
                                context.clearRect(0, 0, canvasElement.width, canvasElement.height);
                                canvasElement.width = img.width;
                                canvasElement.height = img.height;
                                context.drawImage(img, 0, 0, img.width, img.height);
                                context.lineWidth = size;
                                context.strokeStyle = color;
                                context.lineJoin = "round";
                                context.lineCap = "round";
                                imageApi = img;
                            };
                            img.src = imageUrl;
                        } else {
                            console.error("No image URL found in the API response.");
                        }
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