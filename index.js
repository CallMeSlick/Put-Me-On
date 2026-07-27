// =========================
// SYSTEM THEME MATCHING & TOGGLE
// =========================
const themeButton = document.getElementById("theme-button");

const detectSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
};

const toggleTheme = () => {
    document.body.classList.toggle("light-mode");
};

if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
}

window.addEventListener("DOMContentLoaded", () => {
    detectSystemTheme();
    reveal();
});


// =========================
// PETITION & OBJECT REFACTOR
// =========================
const signButton = document.getElementById("sign-now-button");
let signatureCount = 3;

const addSignature = (person) => {
    const signatures = document.querySelector(".signatures");
    if (!signatures) return;
    
    const newSignature = document.createElement("p");
    newSignature.textContent = "🖊️ " + person.name + " from " + person.hometown + " supports this.";
    signatures.appendChild(newSignature);

    signatureCount++;
    document.getElementById("signature-count").textContent = "Total Signatures: " + signatureCount;
};


// =========================
// FORM VALIDATION & MODAL TRIGGER
// =========================
const validateForm = () => {
    let containsErrors = false;
    const petitionForm = document.getElementById("sign-petition");
    if (!petitionForm) return;

    const petitionInputs = petitionForm.elements;

    for (let i = 0; i < petitionInputs.length; i++) {
        if (petitionInputs[i].value.length < 2) {
            petitionInputs[i].classList.add("error");
            containsErrors = true;
        } else {
            petitionInputs[i].classList.remove("error");
        }
    }

    const email = document.getElementById("email");
    if (email && !email.value.includes(".com")) {
        email.classList.add("error");
        containsErrors = true;
    }

    if (!containsErrors) {
        const person = {
            name: document.getElementById("name").value,
            hometown: document.getElementById("hometown").value,
            email: document.getElementById("email").value
        };

        addSignature(person);
        toggleModal(person);

        for (let i = 0; i < petitionInputs.length; i++) {
            petitionInputs[i].value = "";
            petitionInputs[i].classList.remove("error");
        }
    }
};

if (signButton) {
    signButton.addEventListener("click", validateForm);
}


// =========================
// MODAL ANIMATION & TIMERS
// =========================
const modal = document.getElementById("thanks-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalImg = document.getElementById("modal-img");
let modalTimeoutId;
let intervalId;

const animateImage = () => {
    let scale = 1;
    let growing = true;

    intervalId = setInterval(() => {
        if (growing) {
            scale += 0.03;
            if (scale >= 1.15) growing = false;
        } else {
            scale -= 0.03;
            if (scale <= 0.95) growing = true;
        }
        if (modalImg) {
            modalImg.style.transform = `scale(${scale}) rotate(${scale * 8 - 8}deg)`;
        }
    }, 80);
};

const toggleModal = (person) => {
    if (!modal) return;
    
    const thanksText = document.getElementById("thanks-modal-content");
    if (thanksText) {
        thanksText.textContent = `Thank you so much, ${person.name}!`;
    }

    modal.style.display = "flex";
    animateImage();

    modalTimeoutId = setTimeout(() => {
        closeModal();
    }, 4000);
};

const closeModal = () => {
    if (!modal) return;
    modal.style.display = "none";
    clearInterval(intervalId);
    clearTimeout(modalTimeoutId);
};

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}


// =========================
// SCROLL ANIMATION
// =========================
const animation = {
    revealDistance: 50,
    initialOpacity: 0,
    transitionDelay: 0,
    transitionDuration: "1s",
    transitionProperty: "all",
    transitionTimingFunction: "ease",
    reduceMotion: false
};

const reveal = () => {
    const revealableContainers = document.querySelectorAll(".revealable");

    for (let i = 0; i < revealableContainers.length; i++) {
        const windowHeight = window.innerHeight;
        const topOfRevealableContainer = revealableContainers[i].getBoundingClientRect().top;

        if (animation.reduceMotion) {
            revealableContainers[i].style.transition = "none";
            revealableContainers[i].style.opacity = 1;
            revealableContainers[i].classList.add("active");
        } else {
            revealableContainers[i].style.transitionProperty = animation.transitionProperty;
            revealableContainers[i].style.transitionDuration = animation.transitionDuration;
            revealableContainers[i].style.transitionTimingFunction = animation.transitionTimingFunction;
            revealableContainers[i].style.transitionDelay = animation.transitionDelay + "ms";

            if (topOfRevealableContainer < windowHeight - animation.revealDistance) {
                revealableContainers[i].classList.add("active");
                revealableContainers[i].style.opacity = 1;
            } else {
                revealableContainers[i].classList.remove("active");
                revealableContainers[i].style.opacity = animation.initialOpacity;
            }
        }
    }
};

window.addEventListener("scroll", reveal);

// =========================
// SPOTIFY LIVE SEARCH UI
// =========================
const searchInput = document.getElementById("music-search");
const searchContainer = document.querySelector(".nav-search-container");

// Create dropdown element dynamically
let dropdown = document.createElement("div");
dropdown.id = "search-dropdown";
dropdown.className = "search-dropdown";
if (searchContainer) {
    searchContainer.appendChild(dropdown);
}

// Function to fetch tracks from Spotify
async function fetchSpotifyTracks(query) {
    if (!query || query.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        // 1. Get access token from Vercel backend endpoint
        const tokenResponse = await fetch("/api/spotify-token");
        const tokenData = await tokenResponse.json();

        if (!tokenData.token) {
            console.error("Failed to retrieve token from server");
            return;
        }

        // 2. Fetch tracks using the token
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
            headers: {
                'Authorization': `Bearer ${tokenData.token}`
            }
        });

        if (!response.ok) {
            console.error("Spotify API error status:", response.status);
            return;
        }

        const data = await response.json();
        renderSearchResults(data.tracks.items);
    } catch (error) {
        console.error("Spotify search error:", error);
    }
}

// Render search results inside dropdown
function renderSearchResults(tracks) {
    if (!tracks || tracks.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    dropdown.innerHTML = "";
    
    tracks.forEach(track => {
        const item = document.createElement("div");
        item.className = "search-item";
        
        const img = document.createElement("img");
        img.src = track.album.images[2]?.url || track.album.images[0]?.url;
        img.alt = track.name;

        const info = document.createElement("div");
        info.className = "search-item-info";
        info.innerHTML = `<strong>${track.name}</strong><br><small>${track.artists[0].name}</small>`;

        item.appendChild(img);
        item.appendChild(info);

        // When a user clicks a song from the search results
        item.addEventListener("click", () => {
            alert(`You selected: ${track.name} by ${track.artists[0].name}!`);
            dropdown.style.display = "none";
        });

        dropdown.appendChild(item);
    });

    dropdown.style.display = "block";
}

// Attach event listener with debounce
let debounceTimer;
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchSpotifyTracks(e.target.value);
        }, 300);
    });
}

// Close dropdown if user clicks outside
document.addEventListener("click", (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
        dropdown.style.display = "none";
    }
});
