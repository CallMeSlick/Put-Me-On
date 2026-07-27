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

// =========================
// SONG DETAIL PAGE (song.html)
// =========================
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get("id");

    if (trackId && document.getElementById("song-detail-card")) {
        loadSongDetails(trackId);
    }
});

async function loadSongDetails(trackId) {
    const loadingDiv = document.getElementById("song-loading");
    const cardDiv = document.getElementById("song-detail-card");

    try {
        const tokenResponse = await fetch("/api/spotify-token");
        const tokenData = await tokenResponse.json();

        if (!tokenData.token) {
            loadingDiv.innerHTML = "<h2>Unable to connect to Spotify.</h2>";
            return;
        }

        const response = await fetch(`developer.spotify.com${trackId}`, {
            headers: { 'Authorization': `Bearer ${tokenData.token}` }
        });

        const track = await response.json();

        // Fill in song details
        document.getElementById("song-cover").src = track.album.images[0]?.url;
        document.getElementById("song-title").textContent = track.name;
        document.getElementById("song-artist").textContent = `Artist: ${track.artists.map(a => a.name).join(", ")}`;
        document.getElementById("song-album").textContent = `Album: ${track.album.name} (${track.album.release_date.split('-')[0]})`;

        // Handle Audio Preview
        const audioElement = document.getElementById("audio-preview");
        const audioContainer = document.getElementById("audio-container");
        const noPreview = document.getElementById("no-preview");

        if (track.preview_url) {
            audioElement.src = track.preview_url;
            audioContainer.style.display = "block";
            noPreview.style.display = "none";
        } else {
            audioContainer.style.display = "none";
            noPreview.style.display = "block";
        }

        // Recommend button action
        document.getElementById("recommend-btn").addEventListener("click", () => {
            window.location.href = `index.html#post`;
        });

        loadingDiv.style.display = "none";
        cardDiv.style.display = "flex";
    } catch (err) {
        console.error(err);
        loadingDiv.innerHTML = "<h2>Error loading song details.</h2>";
    }
}

// =========================
// ARTIST DISCOGRAPHY PAGE (artist.html)
// =========================
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get("id");

    if (artistId && document.getElementById("artist-profile")) {
        loadArtistPage(artistId);
    }
});

async function loadArtistPage(artistId) {
    const loading = document.getElementById("artist-loading");
    const profile = document.getElementById("artist-profile");
    const discography = document.getElementById("discography-container");

    try {
        const tokenResponse = await fetch("/api/spotify-token");
        const tokenData = await tokenResponse.json();

        if (!tokenData.token) {
            loading.innerHTML = "<h2>Unable to connect to Spotify.</h2>";
            return;
        }

        const headers = { 'Authorization': `Bearer ${tokenData.token}` };

        // 1. Fetch Artist Details
        const artistRes = await fetch(`http://googleusercontent.com/spotify.com/7${artistId}`, { headers });
        const artist = await artistRes.json();

        document.getElementById("artist-img").src = artist.images[0]?.url || 'PutMeOnMascot.png';
        document.getElementById("artist-name").textContent = artist.name;
        document.getElementById("artist-genres").textContent = artist.genres.slice(0, 3).join(" • ").toUpperCase();
        document.getElementById("artist-followers").textContent = `👥 ${artist.followers.total.toLocaleString()} Followers on Spotify`;

        // 2. Fetch Top Tracks
        const topTracksRes = await fetch(`http://googleusercontent.com/spotify.com/7${artistId}/top-tracks?market=US`, { headers });
        const topTracksData = await topTracksRes.json();
        const topTracksList = document.getElementById("top-tracks-list");

        topTracksList.innerHTML = "";
        topTracksData.tracks.slice(0, 5).forEach((track, index) => {
            const trackRow = document.createElement("div");
            trackRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;";
            trackRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: bold; color: #7FDBFF; width: 20px;">#${index + 1}</span>
                    <img src="${track.album.images[2]?.url || track.album.images[0]?.url}" style="width: 40px; height: 40px; border-radius: 4px; margin: 0;">
                    <div>
                        <strong style="color: #f3f4f6;">${track.name}</strong>
                        <p style="margin: 0; font-size: 12px; color: #a0aec0;">${track.album.name}</p>
                    </div>
                </div>
                <button style="padding: 6px 14px; font-size: 12px;">Listen</button>
            `;
            trackRow.addEventListener("click", () => {
                window.location.href = `song.html?id=${track.id}`;
            });
            topTracksList.appendChild(trackRow);
        });

        // 3. Fetch Albums
        const albumsRes = await fetch(`http://googleusercontent.com/spotify.com/7${artistId}/albums?include_groups=album,single&limit=8`, { headers });
        const albumsData = await albumsRes.json();
        const albumsGrid = document.getElementById("albums-grid");

        albumsGrid.innerHTML = "";
        albumsData.items.forEach(album => {
            const albumCard = document.createElement("div");
            albumCard.style.cssText = "background: #161922; border: 1px solid rgba(127,219,255,0.2); border-radius: 10px; padding: 12px; text-align: center; cursor: pointer;";
            albumCard.innerHTML = `
                <img src="${album.images[0]?.url}" style="width: 100%; aspect-ratio: 1; border-radius: 6px; margin: 0 0 10px 0; object-fit: cover;">
                <strong style="font-size: 14px; display: block; color: #f3f4f6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${album.name}</strong>
                <small style="color: #a0aec0;">${album.release_date.split('-')[0]} • ${album.album_type}</small>
            `;
            albumCard.addEventListener("click", () => {
                window.location.href = `album.html?id=${album.id}`;
            });
            albumsGrid.appendChild(albumCard);
        });

        // Show contents
        loading.style.display = "none";
        profile.style.display = "flex";
        discography.style.display = "block";

        // Handle Comment Submission
        setupComments(artistId);

    } catch (err) {
        console.error(err);
        loading.innerHTML = "<h2>Error loading artist profile.</h2>";
    }
}

function setupComments(artistId) {
    const form = document.getElementById("artist-comment-form");
    const commentsList = document.getElementById("comments-list");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("comment-user").value.trim();
        const text = document.getElementById("comment-text").value.trim();

        if (user && text) {
            const noComments = commentsList.querySelector(".no-comments");
            if (noComments) noComments.remove();

            const commentCard = document.createElement("div");
            commentCard.style.cssText = "background: #161922; border-left: 4px solid #b18cff; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;";
            commentCard.innerHTML = `
                <strong style="color: #7FDBFF;">@${user}</strong>
                <p style="margin: 5px 0 0 0; color: #e2e8f0; padding: 0;">${text}</p>
            `;
            commentsList.prepend(commentCard);

            document.getElementById("comment-user").value = "";
            document.getElementById("comment-text").value = "";
        }
    });
}

// =========================
// ALBUM PAGE LOGIC (album.html)
// =========================
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get("id");

    if (albumId && document.getElementById("album-profile")) {
        loadAlbumPage(albumId);
    }
});

async function loadAlbumPage(albumId) {
    const loading = document.getElementById("album-loading");
    const profile = document.getElementById("album-profile");
    const container = document.getElementById("album-content-container");

    try {
        const tokenResponse = await fetch("/api/spotify-token");
        const tokenData = await tokenResponse.json();

        if (!tokenData.token) {
            loading.innerHTML = "<h2>Unable to connect to Spotify.</h2>";
            return;
        }

        const headers = { 'Authorization': `Bearer ${tokenData.token}` };

        // Fetch Album Details from Spotify
        const albumRes = await fetch(`http://googleusercontent.com/spotify.com/5${albumId}`, { headers });
        const album = await albumRes.json();

        document.getElementById("album-cover-img").src = album.images[0]?.url;
        document.getElementById("album-title-text").textContent = album.name;
        document.getElementById("album-artist-name").textContent = `By ${album.artists.map(a => a.name).join(", ")}`;
        document.getElementById("album-meta-info").textContent = `${album.release_date.split('-')[0]} • ${album.total_tracks} Tracks`;

        // Render Tracklist
        const tracklistContainer = document.getElementById("album-tracklist");
        tracklistContainer.innerHTML = "";

        album.tracks.items.forEach((track, index) => {
            const trackRow = document.createElement("div");
            trackRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer;";
            
            // Format track duration
            const minutes = Math.floor(track.duration_ms / 60000);
            const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
            const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            trackRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: bold; color: #7FDBFF; width: 25px;">${index + 1}.</span>
                    <div>
                        <strong style="color: #f3f4f6; font-size: 15px;">${track.name}</strong>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #a0aec0;">${track.artists.map(a => a.name).join(", ")}</p>
                    </div>
                </div>
                <span style="color: #a0aec0; font-size: 13px;">${durationFormatted}</span>
            `;

            trackRow.addEventListener("click", () => {
                window.location.href = `song.html?id=${track.id}`;
            });

            tracklistContainer.appendChild(trackRow);
        });

        loading.style.display = "none";
        profile.style.display = "flex";
        container.style.display = "block";

        setupAlbumComments();

    } catch (err) {
        console.error(err);
        loading.innerHTML = "<h2>Error loading album details.</h2>";
    }
}

function setupAlbumComments() {
    const form = document.getElementById("album-comment-form");
    const commentsList = document.getElementById("album-comments-list");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("album-user").value.trim();
        const text = document.getElementById("album-review-text").value.trim();

        if (user && text) {
            const noComments = commentsList.querySelector(".no-album-comments");
            if (noComments) noComments.remove();

            const commentCard = document.createElement("div");
            commentCard.style.cssText = "background: #161922; border-left: 4px solid #7FDBFF; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;";
            commentCard.innerHTML = `
                <strong style="color: #b18cff;">@${user}</strong>
                <p style="margin: 5px 0 0 0; color: #e2e8f0; padding: 0;">${text}</p>
            `;
            commentsList.prepend(commentCard);

            document.getElementById("album-user").value = "";
            document.getElementById("album-review-text").value = "";
        }
    });
}
