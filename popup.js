document.addEventListener("DOMContentLoaded", function () {
    const memeButton = document.getElementById("generate-meme");
    const memeImage = document.getElementById("meme-img");
    const categorySelect = document.getElementById("category");

    let lastMemes = []; // Stores the last 10 displayed memes
    let controller = null; // Initialize as null to avoid errors

    async function fetchMeme() {
        const selectedCategory = categorySelect.value;
        const apiUrl = `https://meme-api.com/gimme/${selectedCategory}`;

        // Cancel previous request if it exists
        if (controller) {
            controller.abort();
        }

        // Create a new AbortController for the new request
        controller = new AbortController();
        const { signal } = controller;

        // Show loading message before the new meme appears
        memeImage.src = "https://via.placeholder.com/250?text=Loading...";

        try {
            // Set a timeout (5 seconds) to avoid long loading times
            const response = await Promise.race([
                fetch(apiUrl, { signal }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
            ]);

            if (!response.ok) throw new Error("Error fetching meme");

            const data = await response.json();

            // Avoid repeating recent memes
            if (lastMemes.includes(data.url)) {
                console.log("Duplicate meme, fetching another...");
                return fetchMeme();
            }

            memeImage.src = data.url; // Update image

            // Add to history and remove the oldest if it exceeds 10
            lastMemes.push(data.url);
            if (lastMemes.length > 10) {
                lastMemes.shift();
            }
        } catch (error) {
            console.log("Error loading meme:", error);
            memeImage.src = "https://via.placeholder.com/250?text=Error+Loading";
        }
    }

    memeButton.addEventListener("click", fetchMeme);
    categorySelect.addEventListener("change", fetchMeme); // Update meme when category changes

    // Load an initial meme when the extension opens
    fetchMeme();
});
