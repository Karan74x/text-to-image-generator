const themeToggle =  document.querySelector(".theme-toggle");
const promptInput = document.querySelector(".prompt-input");
const promptForm = document.querySelector(".prompt-form");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn")
const modelSelect = document.querySelector("#model-select");
const ratioSelect = document.querySelector("#ratio-select");
const countSelect = document.querySelector("#count-select");
const gridGallery = document.querySelector(".gallery-grid");



const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

// set theme based on saved preference or system default
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme ==="dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);

    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();


// Switch between light to dark themes
const toggleTheme = () =>{
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

const getImageDimensions = (aspectRatio) => {
    switch (aspectRatio) {
        case "1/1":  return { width: 768, height: 768 };
        case "16/9": return { width: 1024, height: 576 };
        case "9/16": return { width: 576, height: 1024 };
        default:     return { width: 768, height: 768 };
    }
};

const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;
    imgCard.classList.remove("loading");

    // Fixed the download attribute syntax below
    imgCard.innerHTML = `
        <img src="${imgUrl}" class="result-img">
        <div class="img-overlay">
            <a href="${imgUrl}" class="img-download-btn" download="image-${Date.now()}.png">
                <i class="fa-solid fa-download"></i>
            </a>
        </div>`;
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const { width, height } = getImageDimensions(aspectRatio);

    const btnToDisable = document.querySelector(".generate-btn");
    btnToDisable.setAttribute("disabled", "true");

    const buildModelPrompt = () => {
        switch (selectedModel) {
            case "flux":
                return `flux-${promptText}`;
            case "openjourney":
                return `openjourney-${promptText}`;
            case "sdxl":
                return promptText;
            default:
                return promptText;
        }
    };

    const finalPrompt = buildModelPrompt();

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const apiURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}`;

            const response = await fetch(apiURL);
            if (!response.ok) throw new Error("Image generation failed");

            const blob = await response.blob();
            const imgURL = URL.createObjectURL(blob);

            updateImageCard(i, imgURL);
        } catch (error) {
            console.error(error);
            const imgCard = document.getElementById(`img-card-${i}`);
            if (imgCard) {
                imgCard.classList.remove("loading");
                imgCard.classList.add("error");
                imgCard.querySelector(".status-text").textContent = "Generation failed!";
            }
        }
    });

    await Promise.allSettled(imagePromises);
    btnToDisable.removeAttribute("disabled");
};


// Create placeholder cards with loading spinners
const createImagecards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";
    for (let i = 0; i < imageCount; i++) {
        // FIXED: Added the missing " after ${aspectRatio}
        gridGallery.innerHTML += `
        <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
            <div class="status-container">
                <div class="spinner"></div>
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="status-text">Generating...</p>
            </div>
        </div>`;
    }
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Handle form submission
const handleFormSubmit = (e) =>{
    e.preventDefault();

    // Get form values

    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    createImagecards(selectedModel, imageCount, aspectRatio, promptText);

}
// Fill prompt input with random example
promptBtn.addEventListener("click", () =>{
const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
promptInput.value = prompt;
promptInput.focus();
})

promptForm.addEventListener("submit", handleFormSubmit);

themeToggle.addEventListener("click", toggleTheme);
