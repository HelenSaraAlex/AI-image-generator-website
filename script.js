const MODEL_ID = "CompVis/stable-diffusion-v1-4";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
const HF_API_TOKEN = "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"; // Replace with your actual token

const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

let isImageGenerating = false;

const createLoadingCard = () => {
  const imgCard = document.createElement("div");
  imgCard.className = "img-card loading";

  const spinner = document.createElement("div");
  spinner.className = "spinner";

  imgCard.appendChild(spinner);
  imageGallery.appendChild(imgCard);
  return imgCard;
};

const updateImageCard = (imgCard, blob) => {
  imgCard.classList.remove("loading");
  imgCard.innerHTML = ""; // Clear the spinner

  const imgElement = document.createElement("img");
  imgElement.src = URL.createObjectURL(blob); // Create a URL for the blob
  imgElement.alt = "AI generated image";

  const downloadBtn = document.createElement("a");
  downloadBtn.className = "download-btn";
  downloadBtn.href = imgElement.src;
  downloadBtn.download = `${new Date().getTime()}.png`;

  const downloadIcon = document.createElement("img");
  downloadIcon.src = "images/download.svg"; // Ensure this path is correct
  downloadIcon.alt = "Download icon";

  downloadBtn.appendChild(downloadIcon);
  imgCard.appendChild(imgElement);
  imgCard.appendChild(downloadBtn);
};

const generateSingleImage = async (userPrompt, index) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: userPrompt,
        parameters: {
          num_inference_steps: 50,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 10000) + index, // Ensure different seed for each image
        },
      }),
    });

    if (!response.ok) throw new Error("Failed to generate AI images. Make sure your API token is valid.");

    const blob = await response.blob(); // Get the response as a Blob
    return blob;
  } catch (error) {
    throw error;
  }
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    imageGallery.innerHTML = ""; // Clear previous images

    const promises = [];
    for (let i = 0; i < userImgQuantity; i++) {
      const loadingCard = createLoadingCard();
      promises.push(
        generateSingleImage(userPrompt, i)
          .then((blob) => updateImageCard(loadingCard, blob))
          .catch((error) => alert(error.message))
      );
    }

    await Promise.all(promises);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  const userPrompt = e.target.querySelector(".prompt-input").value;
  const userImgQuantity = parseInt(e.target.querySelector(".img-quantity").value);

  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleImageGeneration);
