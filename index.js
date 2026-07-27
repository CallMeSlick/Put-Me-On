// ==========================================================================
// SYSTEM THEME, SESSION & INITIALIZATION
// ==========================================================================

const toggleTheme = () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme_preference", isLight ? "light" : "dark");
};

window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme_preference");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const isAuthPage = ["signin.html", "signup.html", "forgot-password.html"].includes(currentPage);
    if (!isAuthPage) {
        sessionStorage.setItem("lastContentPage", currentPage);
    }

    checkUserSession();
    checkAuthorPermissions();
    loadAuthorPickData();
    updateProfileStats();
    initSocialListPage();
    initSearchEngine();

    const themeBtn = document.getElementById("theme-button");
    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }
});

function checkUserSession() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const navActions = document.querySelector(".nav-actions");
    const currentPage = window.location.pathname.split("/").pop();
    const isAuthPage = ["signin.html", "signup.html", "forgot-password.html"].includes(currentPage);

    if (navActions) {
        if (loggedInUser) {
            // Display exact stored username as written (preserving uppercase/lowercase)
            const userDisplayName = document.getElementById("user-display-name");
            if (userDisplayName) {
                userDisplayName.textContent = loggedInUser;
            }

            let settingsGear = !isAuthPage ? `<a href="settings.html" class="nav-pill" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2);" title="Settings">⚙️</a>` : '';

            navActions.innerHTML = `
                <a href="profile.html" class="nav-pill" style="background-color: #7FDBFF; color: #0d0e12;">Profile</a>
                <a href="index.html#post" class="nav-pill" style="background-color: #b18cff; color: #0d0e12;">Post</a>
                <button id="theme-button" class="nav-pill nav-theme">Theme</button>
                ${settingsGear}
            `;
        } else {
            navActions.innerHTML = `
                <a href="signin.html" class="nav-pill nav-signin">Sign In</a>
                <a href="signup.html" class="nav-pill nav-signup">Sign Up</a>
                <button id="theme-button" class="nav-pill nav-theme">Theme</button>
                <a href="settings.html" class="nav-pill" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2);" title="Settings">⚙️</a>
            `;
        }

        const themeBtn = document.getElementById("theme-button");
        if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    }
}

function signOutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}


// ==========================================================================
// SEARCH BAR ENTER KEY REDIRECT
// ==========================================================================

const searchInput = document.getElementById("music-search");
if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim().length > 0) {
            e.preventDefault();
            window.location.href = `search.html?query=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}


// ==========================================================================
// AUTHENTICATION ENGINE (EXACT CASING PRESERVATION)
// ==========================================================================

function displayAuthError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
        errorEl.style.color = "#ff4136";
        errorEl.style.backgroundColor = "rgba(255, 65, 54, 0.15)";
        errorEl.style.border = "1px solid #ff4136";
        errorEl.style.padding = "10px";
        errorEl.style.borderRadius = "8px";
        errorEl.style.marginBottom = "15px";
        errorEl.style.fontWeight = "bold";
    } else {
        alert(message);
    }
}

// 1. SIGN IN
const signinForm = document.getElementById("signin-form");
if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        try {
            const usernameInput = document.getElementById("signin-username");
            const passwordInput = document.getElementById("signin-password");

            if (!usernameInput || !passwordInput) {
                displayAuthError("auth-error", "Error: Input fields missing. Please refresh.");
                return;
            }

            const rawUsername = usernameInput.value.trim();
            const pass = passwordInput.value;

            const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");

            const matchedKey = Object.keys(users).find(
                u => u.toLowerCase() === rawUsername.toLowerCase()
            );

            if (!matchedKey) {
                displayAuthError("auth-error", "Error: Username not found. Please check your spelling or Sign Up.");
                return;
            }

            if (users[matchedKey].pass !== pass) {
                displayAuthError("auth-error", "Error: Incorrect password. Please try again.");
                return;
            }

            // Store exact display name entered during signup
            const preservedName = users[matchedKey].displayName || matchedKey;
            localStorage.setItem("loggedInUser", preservedName);

            const returnPage = sessionStorage.getItem("lastContentPage") || "index.html";
            window.location.href = returnPage;

        } catch (err) {
            displayAuthError("auth-error", "Error: An unexpected authentication error occurred.");
        }
    });
}

// 2. SIGN UP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        try {
            const rawUsername = document.getElementById("signup-username").value.trim();
            const email = document.getElementById("signup-email").value.trim().toLowerCase();
            const pass = document.getElementById("signup-password").value;
            const confirmPass = document.getElementById("signup-password-confirm").value;

            const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");

            const existingUser = Object.keys(users).find(
                u => u.toLowerCase() === rawUsername.toLowerCase()
            );

            if (existingUser) {
                displayAuthError("signup-error", `Error: The username '${rawUsername}' is already taken!`);
                return;
            }

            const existingEmailUser = Object.keys(users).find(u => users[u].email === email);
            if (existingEmailUser) {
                displayAuthError("signup-error", "Error: An account is already registered with this Gmail address!");
                return;
            }

            if (pass !== confirmPass) {
                displayAuthError("signup-error", "Error: Passwords do not match. Please retype password.");
                return;
            }

            if (pass.length < 4) {
                displayAuthError("signup-error", "Error: Password must be at least 4 characters long.");
                return;
            }

            users[rawUsername] = { 
                email: email, 
                pass: pass, 
                displayName: rawUsername 
            };
            
            localStorage.setItem("pmo_users", JSON.stringify(users));
            localStorage.setItem("loggedInUser", rawUsername);

            const returnPage = sessionStorage.getItem("lastContentPage") || "index.html";
            window.location.href = returnPage;

        } catch (err) {
            displayAuthError("signup-error", "Error: Could not complete registration. Please try again.");
        }
    });
}


// ==========================================================================
// PROFILE TABS & PLAYLIST SUB-TAB SWITCHER
// ==========================================================================

function switchTab(tabName) {
    const contents = document.querySelectorAll(".profile-tab-content");
    const buttons = document.querySelectorAll(".profile-tab-btn");

    contents.forEach(content => content.style.display = "none");
    buttons.forEach(btn => btn.classList.remove("active-tab"));

    const targetContent = document.getElementById(`tab-${tabName}`);
    if (targetContent) {
        targetContent.style.display = "block";
    }
}

function switchPlaylistSubTab(serviceName) {
    const titleEl = document.getElementById("playlist-service-title");
    const promptEl = document.getElementById("playlist-connect-prompt");

    const btnSpotify = document.getElementById("sub-btn-spotify");
    const btnITunes = document.getElementById("sub-btn-itunes");
    const btnYouTube = document.getElementById("sub-btn-youtube");

    [btnSpotify, btnITunes, btnYouTube].forEach(btn => {
        if (btn) btn.classList.remove("active-sub-tab");
    });

    if (serviceName === 'Spotify') {
        if (btnSpotify) btnSpotify.classList.add("active-sub-tab");
        if (titleEl) {
            titleEl.textContent = "Synced Spotify Playlists";
            titleEl.style.color = "#1DB954";
        }
    } else if (serviceName === 'iTunes') {
        if (btnITunes) btnITunes.classList.add("active-sub-tab");
        if (titleEl) {
            titleEl.textContent = "Synced iTunes Playlists";
            titleEl.style.color = "#FA233B";
        }
    } else if (serviceName === 'YouTube') {
        if (btnYouTube) btnYouTube.classList.add("active-sub-tab");
        if (titleEl) {
            titleEl.textContent = "Synced YouTube Music Playlists";
            titleEl.style.color = "#FF0000";
        }
    }

    if (promptEl) {
        promptEl.textContent = `Connect your ${serviceName} account in Settings to view your public and private playlists here! Your public playlists can be viewed by others, while your private playlists are only viewed by those you've shared it with.`;
    }
}

function updateProfileStats() {
    const following = JSON.parse(localStorage.getItem("following_list") || "[]");
    const followers = JSON.parse(localStorage.getItem("followers_list") || "[]");
    const artists = JSON.parse(localStorage.getItem("followed_artists_list") || "[]");

    const statFollowers = document.getElementById("stat-followers");
    const statFollowing = document.getElementById("stat-following");
    const statArtists = document.getElementById("stat-artists");

    if (statFollowers) statFollowers.textContent = followers.length;
    if (statFollowing) statFollowing.textContent = following.length;
    if (statArtists) statArtists.textContent = artists.length;
}


// ==========================================================================
// AUTHOR PICK ADMIN PERMISSIONS
// ==========================================================================

function checkAuthorPermissions() {
    const loggedInUser = (localStorage.getItem("loggedInUser") || "").toLowerCase();
    const editControls = document.getElementById("author-edit-controls");

    if ((loggedInUser === "callmeslick" || loggedInUser === "callmesiick") && editControls) {
        editControls.style.display = "block";
    }
}

function toggleAuthorForm() {
    const form = document.getElementById("author-update-form");
    if (form) {
        form.style.display = form.style.display === "none" ? "flex" : "none";
    }
}

function loadAuthorPickData() {
    const savedPick = JSON.parse(localStorage.getItem("author_custom_pick") || "null");
    if (savedPick) {
        const songEl = document.getElementById("author-song-title");
        const artistEl = document.getElementById("author-artist-name");
        const albumEl = document.getElementById("author-album-name");
        const genreEl = document.getElementById("author-genre-name");
        const descEl = document.getElementById("author-description-text");

        if (songEl) songEl.textContent = savedPick.song;
        if (artistEl) artistEl.textContent = savedPick.artist;
        if (albumEl) albumEl.textContent = savedPick.album;
        if (genreEl) genreEl.textContent = savedPick.genre;
        if (descEl) descEl.textContent = savedPick.desc;
    }
}

const authorUpdateForm = document.getElementById("author-update-form");
if (authorUpdateForm) {
    authorUpdateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pickData = {
            song: document.getElementById("edit-song-title").value.trim(),
            artist: document.getElementById("edit-artist-name").value.trim(),
            album: document.getElementById("edit-album-name").value.trim(),
            genre: document.getElementById("edit-genre-name").value.trim(),
            desc: document.getElementById("edit-description").value.trim()
        };

        localStorage.setItem("author_custom_pick", JSON.stringify(pickData));
        loadAuthorPickData();
        toggleAuthorForm();
        alert("Author Pick updated successfully!");
    });
}


// ==========================================================================
// DYNAMIC SOCIAL FOLLOW LISTS
// ==========================================================================

const mockCommunityData = [
    { username: "Alex_NYC", pfp: "PutMeOnMascot.png", type: "user" },
    { username: "Jordan_Chi", pfp: "PutMeOnMascot.png", type: "user" },
    { username: "Sophia_FL", pfp: "PutMeOnMascot.png", type: "user" },
    { username: "Taylor_LA", pfp: "PutMeOnMascot.png", type: "user" },
    { username: "The Weeknd", pfp: "PutMeOnLogo.png", type: "artist" },
    { username: "Kendrick Lamar", pfp: "PutMeOnLogo.png", type: "artist" },
    { username: "SZA", pfp: "PutMeOnLogo.png", type: "artist" }
];

function initSocialListPage() {
    const listContainer = document.getElementById("social-accounts-list");
    const searchInputEl = document.getElementById("social-user-search");
    const titleEl = document.getElementById("social-title");

    if (!listContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const viewType = urlParams.get("type") || "following";

    if (titleEl) {
        if (viewType === "followers") titleEl.textContent = "👥 Followers";
        else if (viewType === "artists") titleEl.textContent = "🎤 Followed Artists";
        else titleEl.textContent = "🎧 Following";
    }

    renderSocialList("", viewType);

    if (searchInputEl) {
        searchInputEl.addEventListener("input", (e) => {
            renderSocialList(e.target.value.trim().toLowerCase(), viewType);
        });
    }
}

function renderSocialList(filterText, viewType) {
    const listContainer = document.getElementById("social-accounts-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    let followingList = JSON.parse(localStorage.getItem("following_list") || "[]");

    const filtered = mockCommunityData.filter(item => {
        const matchesName = item.username.toLowerCase().includes(filterText);
        if (viewType === "artists") return matchesName && item.type === "artist";
        return matchesName && item.type === "user";
    });

    filtered.forEach(item => {
        const isFollowing = followingList.includes(item.username);
        const card = document.createElement("div");
        card.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #161922; padding: 12px 18px; border-radius: 12px; border: 1px solid rgba(127,219,255,0.2);";

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${item.pfp}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <strong style="color: white; font-size: 15px;">@${item.username}</strong>
            </div>
            <button class="nav-pill" onclick="toggleFollowUser('${item.username}', this)" style="background-color: ${isFollowing ? '#ff4136' : '#7FDBFF'}; color: ${isFollowing ? 'white' : 'black'}; font-size: 16px; padding: 6px 16px;">
                ${isFollowing ? '-' : '+'}
            </button>
        `;

        listContainer.appendChild(card);
    });
}

function toggleFollowUser(username, btnEl) {
    let followingList = JSON.parse(localStorage.getItem("following_list") || "[]");

    if (followingList.includes(username)) {
        followingList = followingList.filter(u => u !== username);
        btnEl.textContent = "+";
        btnEl.style.backgroundColor = "#7FDBFF";
        btnEl.style.color = "black";
    } else {
        followingList.push(username);
        btnEl.textContent = "-";
        btnEl.style.backgroundColor = "#ff4136";
        btnEl.style.color = "white";
    }

    localStorage.setItem("following_list", JSON.stringify(followingList));
    updateProfileStats();
}


// ==========================================================================
// STRICT WORD-PRIORITY MUSIC SEARCH ENGINE
// ==========================================================================

let currentSearchFilter = "all";
let activeSearchQuery = "";
let fetchedSearchResults = {
    songs: [],
    albums: [],
    artists: [],
    playlists: []
};

function initSearchEngine() {
    const resultsContainer = document.getElementById("search-results-container");
    const labelEl = document.getElementById("search-query-label");

    if (!resultsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    activeSearchQuery = (urlParams.get("query") || "").trim();

    if (!activeSearchQuery) {
        if (labelEl) labelEl.textContent = "Please enter a song, artist, album, or vibe in the search bar above.";
        return;
    }

    if (labelEl) {
        labelEl.textContent = `Searching global music database for "${activeSearchQuery}"...`;
    }

    fetchGlobalMusicData(activeSearchQuery);
}

async function fetchGlobalMusicData(query) {
    const labelEl = document.getElementById("search-query-label");
    const container = document.getElementById("search-results-container");

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=150&entity=song,album,musicArtist`);
        const data = await response.json();

        fetchedSearchResults.songs = [];
        fetchedSearchResults.albums = [];
        fetchedSearchResults.artists = [];
        fetchedSearchResults.playlists = [];

        const lowerQuery = query.toLowerCase();
        const addedAlbums = new Set();
        const addedArtists = new Map();

        data.results.forEach(item => {
            // 1. SONGS: MUST have the search term in the song title
            if (item.wrapperType === "track") {
                const titleLower = (item.trackName || "").toLowerCase();

                if (titleLower.includes(lowerQuery)) {
                    fetchedSearchResults.songs.push({
                        id: item.trackId,
                        title: item.trackName,
                        artist: item.artistName,
                        album: item.collectionName,
                        cover: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "300x300bb") : "PutMeOnLogo.png"
                    });
                }

                // Collect artists from track data
                if (item.artistId && !addedArtists.has(item.artistId)) {
                    const artistNameLower = (item.artistName || "").toLowerCase();
                    const priorityScore = artistNameLower.includes(lowerQuery) ? 1 : 2; // Priority 1 if name contains word
                    addedArtists.set(item.artistId, {
                        id: item.artistId,
                        name: item.artistName,
                        genre: item.primaryGenreName || "Artist",
                        image: "PutMeOnLogo.png",
                        priority: priorityScore
                    });
                }
            } 
            // 2. ALBUMS: MUST have the search term in the album title
            else if (item.wrapperType === "collection" && !addedAlbums.has(item.collectionId)) {
                const albumLower = (item.collectionName || "").toLowerCase();
                if (albumLower.includes(lowerQuery)) {
                    addedAlbums.add(item.collectionId);
                    fetchedSearchResults.albums.push({
                        id: item.collectionId,
                        title: item.collectionName,
                        artist: item.artistName,
                        year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : "",
                        cover: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "300x300bb") : "PutMeOnLogo.png"
                    });
                }
            } 
            // 3. ARTISTS
            else if (item.wrapperType === "artist" && !addedArtists.has(item.artistId)) {
                const artistNameLower = (item.artistName || "").toLowerCase();
                const priorityScore = artistNameLower.includes(lowerQuery) ? 1 : 2;
                addedArtists.set(item.artistId, {
                    id: item.artistId,
                    name: item.artistName,
                    genre: item.primaryGenreName || "Artist",
                    image: "PutMeOnLogo.png",
                    priority: priorityScore
                });
            }
        });

        // Convert Artist map to array and sort: Name matches (Priority 1) -> Song/Album related matches (Priority 2)
        fetchedSearchResults.artists = Array.from(addedArtists.values()).sort((a, b) => a.priority - b.priority);

        if (labelEl) {
            labelEl.textContent = `Showing results for "${query}"`;
        }

        renderSearchResults();

    } catch (err) {
        if (container) {
            container.innerHTML = `<p style="color: #ff4136;">Error fetching music search results. Please check your internet connection.</p>`;
        }
    }
}

function filterSearchResults(category) {
    currentSearchFilter = category;

    const buttons = ["all", "songs", "albums", "artists", "playlists"];
    buttons.forEach(b => {
        const btnEl = document.getElementById(`search-filter-${b}`);
        if (btnEl) {
            if (b === category) {
                btnEl.classList.add("active-sub-tab");
                btnEl.style.opacity = "1";
            } else {
                btnEl.classList.remove("active-sub-tab");
                btnEl.style.opacity = "0.6";
            }
        }
    });

    renderSearchResults();
}

function renderSearchResults() {
    const container = document.getElementById("search-results-container");
    if (!container) return;

    container.innerHTML = "";
    let hasAnyResults = false;

    // 1. SONGS
    if ((currentSearchFilter === 'all' || currentSearchFilter === 'songs') && fetchedSearchResults.songs.length > 0) {
        hasAnyResults = true;
        const section = document.createElement("div");
        section.innerHTML = `<h3 style="color: #7FDBFF; margin-bottom: 12px; text-align: left;">🎵 Songs</h3>`;

        fetchedSearchResults.songs.forEach(song => {
            const card = document.createElement("div");
            card.className = "search-result-card";
            card.onclick = () => window.location.href = `song.html?id=${song.id}`;
            card.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <div>
                    <strong>${song.title}</strong><br>
                    <small>${song.artist} • ${song.album}</small>
                </div>
            `;
            section.appendChild(card);
        });
        container.appendChild(section);
    }

    // 2. ALBUMS
    if ((currentSearchFilter === 'all' || currentSearchFilter === 'albums') && fetchedSearchResults.albums.length > 0) {
        hasAnyResults = true;
        const section = document.createElement("div");
        section.innerHTML = `<h3 style="color: #b18cff; margin-bottom: 12px; text-align: left;">💿 Albums</h3>`;

        fetchedSearchResults.albums.forEach(album => {
            const card = document.createElement("div");
            card.className = "search-result-card";
            card.onclick = () => window.location.href = `album.html?id=${album.id}`;
            card.innerHTML = `
                <img src="${album.cover}" alt="${album.title}">
                <div>
                    <strong>${album.title}</strong><br>
                    <small>${album.artist} • ${album.year}</small>
                </div>
            `;
            section.appendChild(card);
        });
        container.appendChild(section);
    }

    // 3. ARTISTS
    if ((currentSearchFilter === 'all' || currentSearchFilter === 'artists') && fetchedSearchResults.artists.length > 0) {
        hasAnyResults = true;
        const section = document.createElement("div");
        section.innerHTML = `<h3 style="color: #7FDBFF; margin-bottom: 12px; text-align: left;">🎤 Artists</h3>`;

        fetchedSearchResults.artists.forEach(artist => {
            const card = document.createElement("div");
            card.className = "search-result-card";
            card.onclick = () => window.location.href = `artist.html?id=${artist.id}`;
            card.innerHTML = `
                <img src="${artist.image}" alt="${artist.name}" style="border-radius: 50%;">
                <div>
                    <strong>${artist.name}</strong><br>
                    <small style="color: #a0aec0;">Artist • ${artist.genre}</small>
                </div>
            `;
            section.appendChild(card);
        });
        container.appendChild(section);
    }

    if (!hasAnyResults) {
        container.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <p style="color: #a0aec0; margin: 0;">No results found for "${activeSearchQuery}". Try searching another name or track!</p>
            </div>
        `;
    }
}

// ==========================================================================
// DYNAMIC ARTIST, ALBUM, AND SONG PAGE ENGINES
// ==========================================================================

window.addEventListener("DOMContentLoaded", () => {
    const pagePath = window.location.pathname;

    if (pagePath.includes("artist.html")) {
        initArtistPageEngine();
    } else if (pagePath.includes("album.html")) {
        initAlbumPageEngine();
    } else if (pagePath.includes("song.html")) {
        initSongPageEngine();
    }
});

function computeRatingColor(ratingVal) {
    if (!ratingVal || ratingVal === "N/A") return "#4a5568";
    const r = parseFloat(ratingVal);
    if (r < 2.0) return "#ff4136"; // Red (Terrible)
    if (r < 3.0) return "#ff851b"; // Orange
    if (r < 4.0) return "#ffdc00"; // Yellow
    if (r < 4.8) return "#7FDBFF"; // Light Blue
    return "#b18cff";              // Purple (Amazing)
}

function getTrackRatingData(trackId) {
    const reviews = JSON.parse(localStorage.getItem(`comments_song_${trackId}`) || "[]");
    if (reviews.length === 0) return { score: "N/A", count: 0 };

    const total = reviews.reduce((acc, rev) => acc + (parseFloat(rev.rating) || 5.0), 0);
    const avg = (total / reviews.length).toFixed(1);
    return { score: avg, count: reviews.length };
}


// --- 1. ARTIST PAGE ---
let activeArtistObj = null;

async function initArtistPageEngine() {
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get("id");
    if (!artistId) return;

    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=album`);
        const data = await response.json();
        if (!data.results || data.results.length === 0) return;

        const artistInfo = data.results[0];
        const albums = data.results.slice(1);
        albums.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

        activeArtistObj = { id: artistInfo.artistId, name: artistInfo.artistName };

        document.getElementById("artist-loading").style.display = "none";
        document.getElementById("artist-profile").style.display = "flex";
        document.getElementById("discography-container").style.display = "block";

        document.getElementById("artist-name").textContent = artistInfo.artistName;
        document.getElementById("artist-genres").textContent = artistInfo.primaryGenreName || "Music Artist";
        document.getElementById("artist-img").src = "PutMeOnLogo.png";

        updateArtistFollowState();
        loadArtistTopTracks(artistInfo.artistName);
        renderArtistAlbumsGrid(albums);
        loadArtistComments(artistInfo.artistId);

        const form = document.getElementById("artist-comment-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const text = document.getElementById("comment-text").value.trim();
                const currentUser = localStorage.getItem("loggedInUser") || "Guest";
                if (!text) return;

                const comments = JSON.parse(localStorage.getItem(`comments_artist_${artistInfo.artistId}`) || "[]");
                comments.unshift({ user: currentUser, text: text, date: new Date().toLocaleDateString() });
                localStorage.setItem(`comments_artist_${artistInfo.artistId}`, JSON.stringify(comments));

                document.getElementById("comment-text").value = "";
                loadArtistComments(artistInfo.artistId);
            });
        }

    } catch (err) {
        console.error("Error loading artist:", err);
    }
}

async function loadArtistTopTracks(artistName) {
    const container = document.getElementById("top-tracks-list");
    if (!container) return;

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&limit=8&entity=song`);
        const data = await response.json();
        container.innerHTML = "";

        data.results.forEach((song, idx) => {
            const ratingData = getTrackRatingData(song.trackId);
            const badgeBg = computeRatingColor(ratingData.score);

            const card = document.createElement("div");
            card.className = "search-result-card";
            card.onclick = () => window.location.href = `song.html?id=${song.trackId}`;

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="color: #a0aec0; font-weight: bold;">#${idx + 1}</span>
                    <img src="${song.artworkUrl100.replace('100x100bb', '300x300bb')}" style="width: 48px; height: 48px; border-radius: 8px;">
                    <div>
                        <strong>${song.trackName}</strong><br>
                        <small style="color: #a0aec0;">${song.collectionName}</small>
                    </div>
                </div>
                <div class="rating-circle ${ratingData.score === 'N/A' ? 'gray' : ''}" style="background-color: ${badgeBg}; width: 34px; height: 34px; font-size: 12px;">
                    ${ratingData.score}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {}
}

function renderArtistAlbumsGrid(albums) {
    const grid = document.getElementById("albums-grid");
    if (!grid) return;
    grid.innerHTML = "";

    albums.forEach(al => {
        const year = al.releaseDate ? new Date(al.releaseDate).getFullYear() : "";
        const card = document.createElement("div");
        card.className = "album-card-item";
        card.onclick = () => window.location.href = `album.html?id=${al.collectionId}`;

        card.innerHTML = `
            <img src="${al.artworkUrl100.replace('100x100bb', '300x300bb')}" style="width: 100%; aspect-ratio: 1/1; border-radius: 8px; object-fit: cover;">
            <strong style="color: white; font-size: 14px; display: block; margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${al.collectionName}</strong>
            <small style="color: #a0aec0;">${year}</small>
        `;
        grid.appendChild(card);
    });
}

function loadArtistComments(artistId) {
    const list = document.getElementById("comments-list");
    if (!list) return;

    const comments = JSON.parse(localStorage.getItem(`comments_artist_${artistId}`) || "[]");
    if (comments.length === 0) {
        list.innerHTML = `<p style="color: #a0aec0; font-style: italic;">No comments yet. Be the first to share your thoughts!</p>`;
        return;
    }

    list.innerHTML = "";
    comments.forEach(c => {
        const item = document.createElement("div");
        item.style.cssText = "background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.08);";
        item.innerHTML = `<strong style="color: #7FDBFF;">@${c.user}</strong> <small style="color: #a0aec0; margin-left: 8px;">${c.date}</small><p style="color: white; margin: 6px 0 0 0;">${c.text}</p>`;
        list.appendChild(item);
    });
}

function updateArtistFollowState() {
    if (!activeArtistObj) return;
    const follows = JSON.parse(localStorage.getItem("followed_artists_list") || "[]");
    const isFollowing = follows.includes(activeArtistObj.name);

    const btn = document.getElementById("artist-follow-btn");
    const countEl = document.getElementById("artist-followers");

    if (btn) {
        btn.textContent = isFollowing ? "Following" : "+ Follow";
        btn.style.backgroundColor = isFollowing ? "#b18cff" : "#7FDBFF";
    }
    if (countEl) {
        countEl.textContent = `${isFollowing ? 1 : 0} On-Site Fan${isFollowing ? '' : 's'}`;
    }
}

function toggleFollowArtist() {
    if (!activeArtistObj) return;
    let follows = JSON.parse(localStorage.getItem("followed_artists_list") || "[]");

    if (follows.includes(activeArtistObj.name)) {
        follows = follows.filter(a => a !== activeArtistObj.name);
    } else {
        follows.push(activeArtistObj.name);
    }

    localStorage.setItem("followed_artists_list", JSON.stringify(follows));
    updateArtistFollowState();
}

function toggleBlockArtist() {
    if (!activeArtistObj) return;
    let blocked = JSON.parse(localStorage.getItem("blocked_artists_list") || "[]");

    if (!blocked.includes(activeArtistObj.name)) {
        blocked.push(activeArtistObj.name);
        localStorage.setItem("blocked_artists_list", JSON.stringify(blocked));
        alert(`Blocked ${activeArtistObj.name}.`);
        window.location.href = "index.html";
    }
}


// --- 2. ALBUM PAGE ---
async function initAlbumPageEngine() {
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get("id");
    if (!albumId) return;

    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&entity=song`);
        const data = await response.json();
        if (!data.results || data.results.length === 0) return;

        const albumInfo = data.results[0];
        const tracks = data.results.slice(1);

        document.getElementById("album-loading").style.display = "none";
        document.getElementById("album-profile").style.display = "flex";
        document.getElementById("album-content-container").style.display = "block";

        document.getElementById("album-cover-img").src = albumInfo.artworkUrl100.replace('100x100bb', '400x400bb');
        document.getElementById("album-title-text").textContent = albumInfo.collectionName;
        document.getElementById("album-artist-name").textContent = albumInfo.artistName;
        document.getElementById("album-meta-info").textContent = `${new Date(albumInfo.releaseDate).getFullYear()} • ${tracks.length} Tracks`;

        renderAlbumTracklist(tracks);
        loadAlbumComments(albumId);

        const form = document.getElementById("album-comment-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const reviewText = document.getElementById("album-review-text").value.trim();
                const currentUser = localStorage.getItem("loggedInUser") || "Guest";
                if (!reviewText) return;

                const reviews = JSON.parse(localStorage.getItem(`comments_album_${albumId}`) || "[]");
                reviews.unshift({ user: currentUser, text: reviewText, date: new Date().toLocaleDateString() });
                localStorage.setItem(`comments_album_${albumId}`, JSON.stringify(reviews));

                document.getElementById("album-review-text").value = "";
                loadAlbumComments(albumId);
            });
        }

    } catch (err) {
        console.error("Error loading album:", err);
    }
}

function switchAlbumTab(tab) {
    const songsTab = document.getElementById("album-tab-songs");
    const commentsTab = document.getElementById("album-tab-comments");
    const btnSongs = document.getElementById("btn-album-songs");
    const btnComments = document.getElementById("btn-album-comments");

    if (tab === 'songs') {
        if (songsTab) songsTab.style.display = "block";
        if (commentsTab) commentsTab.style.display = "none";
        btnSongs.style.backgroundColor = "#7FDBFF";
        btnSongs.style.color = "#0d0e12";
        btnComments.style.backgroundColor = "rgba(255,255,255,0.1)";
        btnComments.style.color = "white";
    } else {
        if (songsTab) songsTab.style.display = "none";
        if (commentsTab) commentsTab.style.display = "block";
        btnComments.style.backgroundColor = "#7FDBFF";
        btnComments.style.color = "#0d0e12";
        btnSongs.style.backgroundColor = "rgba(255,255,255,0.1)";
        btnSongs.style.color = "white";
    }
}

function renderAlbumTracklist(tracks) {
    const list = document.getElementById("album-tracklist");
    if (!list) return;
    list.innerHTML = "";

    tracks.forEach((track, idx) => {
        const ratingData = getTrackRatingData(track.trackId);
        const badgeBg = computeRatingColor(ratingData.score);

        const card = document.createElement("div");
        card.className = "search-result-card";
        card.onclick = () => window.location.href = `song.html?id=${track.trackId}`;

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="color: #a0aec0; font-weight: bold;">${idx + 1}</span>
                <div>
                    <strong>${track.trackName}</strong><br>
                    <small style="color: #a0aec0;">${track.artistName}</small>
                </div>
            </div>
            <div class="rating-circle ${ratingData.score === 'N/A' ? 'gray' : ''}" style="background-color: ${badgeBg}; width: 34px; height: 34px; font-size: 12px;">
                ${ratingData.score}
            </div>
        `;
        list.appendChild(card);
    });
}

function loadAlbumComments(albumId) {
    const list = document.getElementById("album-comments-list");
    if (!list) return;

    const reviews = JSON.parse(localStorage.getItem(`comments_album_${albumId}`) || "[]");
    if (reviews.length === 0) {
        list.innerHTML = `<p class="no-album-comments" style="color: #a0aec0; font-style: italic;">No reviews for this album yet. Share your thoughts below!</p>`;
        return;
    }

    list.innerHTML = "";
    reviews.forEach(r => {
        const card = document.createElement("div");
        card.style.cssText = "background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.08);";
        card.innerHTML = `<strong style="color: #b18cff;">@${r.user}</strong> <small style="color: #a0aec0; margin-left: 8px;">${r.date}</small><p style="color: white; margin: 6px 0 0 0;">${r.text}</p>`;
        list.appendChild(card);
    });
}


// --- 3. SONG PAGE ---
let activeSongObj = null;

async function initSongPageEngine() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get("id");
    if (!trackId) return;

    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`);
        const data = await response.json();
        if (!data.results || data.results.length === 0) return;

        const song = data.results[0];
        activeSongObj = song;

        document.getElementById("song-loading").style.display = "none";
        document.getElementById("song-detail-card").style.display = "flex";
        document.getElementById("song-comments-container").style.display = "block";

        document.getElementById("song-cover").src = song.artworkUrl100.replace('100x100bb', '400x400bb');
        document.getElementById("song-title").textContent = song.trackName;
        
        const artistEl = document.getElementById("song-artist");
        artistEl.textContent = song.artistName;
        artistEl.onclick = () => window.location.href = `artist.html?id=${song.artistId}`;

        const albumEl = document.getElementById("song-album");
        albumEl.textContent = song.collectionName;
        albumEl.onclick = () => window.location.href = `album.html?id=${song.collectionId}`;

        // Audio preview player
        const player = document.getElementById("audio-preview");
        if (song.previewUrl && player) {
            player.src = song.previewUrl;
        } else {
            if (player) player.style.display = "none";
            document.getElementById("no-preview").style.display = "block";
        }

        updateSongRatingDisplay(trackId);
        loadSongComments(trackId);

        const form = document.getElementById("song-comment-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const score = parseFloat(document.getElementById("review-score").value) || 5.0;
                const text = document.getElementById("review-text").value.trim();
                const currentUser = localStorage.getItem("loggedInUser") || "Guest";
                if (!text) return;

                const reviews = JSON.parse(localStorage.getItem(`comments_song_${trackId}`) || "[]");
                reviews.unshift({ user: currentUser, rating: score, text: text, date: new Date().toLocaleDateString() });
                localStorage.setItem(`comments_song_${trackId}`, JSON.stringify(reviews));

                document.getElementById("review-text").value = "";
                updateSongRatingDisplay(trackId);
                loadSongComments(trackId);
            });
        }

    } catch (err) {
        console.error("Error loading song:", err);
    }
}

function updateSongRatingDisplay(trackId) {
    const ratingData = getTrackRatingData(trackId);
    const badge = document.getElementById("song-rating-badge");
    const label = document.getElementById("song-rating-label");

    if (badge) {
        badge.textContent = ratingData.score;
        badge.style.backgroundColor = computeRatingColor(ratingData.score);
        if (ratingData.score === "N/A") badge.classList.add("gray");
        else badge.classList.remove("gray");
    }
    if (label) {
        label.textContent = ratingData.score === "N/A" 
            ? "No User Ratings" 
            : `Average Score (${ratingData.count} review${ratingData.count === 1 ? '' : 's'})`;
    }
}

function loadSongComments(trackId) {
    const list = document.getElementById("song-comments-list");
    if (!list) return;

    const reviews = JSON.parse(localStorage.getItem(`comments_song_${trackId}`) || "[]");
    if (reviews.length === 0) {
        list.innerHTML = `<p style="color: #a0aec0; font-style: italic; text-align: center;">No reviews for this track yet. Be the first to rate it!</p>`;
        return;
    }

    list.innerHTML = "";
    reviews.forEach(r => {
        const badgeBg = computeRatingColor(r.rating);
        const card = document.createElement("div");
        card.style.cssText = "background: rgba(255,255,255,0.03); padding: 14px 18px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: flex-start;";

        card.innerHTML = `
            <div>
                <strong style="color: #7FDBFF;">@${r.user}</strong> <small style="color: #a0aec0; margin-left: 8px;">${r.date}</small>
                <p style="color: white; margin: 8px 0 0 0;">${r.text}</p>
            </div>
            <div class="rating-circle" style="background-color: ${badgeBg}; width: 32px; height: 32px; font-size: 12px;">
                ${parseFloat(r.rating).toFixed(1)}
            </div>
        `;
        list.appendChild(card);
    });
}

function handleSongAction(actionType) {
    if (!activeSongObj) return;

    if (actionType === 'like') {
        let liked = JSON.parse(localStorage.getItem("liked_songs_list") || "[]");
        if (!liked.some(s => s.id === activeSongObj.trackId)) {
            liked.push({ id: activeSongObj.trackId, title: activeSongObj.trackName, artist: activeSongObj.artistName });
            localStorage.setItem("liked_songs_list", JSON.stringify(liked));
            alert(`Added "${activeSongObj.trackName}" to Liked Songs!`);
        } else {
            alert(`"${activeSongObj.trackName}" is already in your Liked Songs.`);
        }
    } else if (actionType === 'dislike') {
        let disliked = JSON.parse(localStorage.getItem("disliked_songs_list") || "[]");
        if (!disliked.some(s => s.id === activeSongObj.trackId)) {
            disliked.push({ id: activeSongObj.trackId, title: activeSongObj.trackName, artist: activeSongObj.artistName });
            localStorage.setItem("disliked_songs_list", JSON.stringify(disliked));
            alert(`Added "${activeSongObj.trackName}" to Disliked Songs.`);
        }
    } else if (actionType === 'block') {
        let blocked = JSON.parse(localStorage.getItem("blocked_songs_list") || "[]");
        if (!blocked.includes(activeSongObj.trackId)) {
            blocked.push(activeSongObj.trackId);
            localStorage.setItem("blocked_songs_list", JSON.stringify(blocked));
            alert(`Blocked "${activeSongObj.trackName}". You won't see it again.`);
            window.location.href = "index.html";
        }
    }
}

function toggleTryOutModal() {
    if (!activeSongObj) return;
    let tryouts = JSON.parse(localStorage.getItem("tryouts_list") || "[]");
    
    if (!tryouts.some(s => s.id === activeSongObj.trackId)) {
        tryouts.push({ id: activeSongObj.trackId, title: activeSongObj.trackName, artist: activeSongObj.artistName });
        localStorage.setItem("tryouts_list", JSON.stringify(tryouts));
        alert(`Saved "${activeSongObj.trackName}" to your Try-Out Bins!`);
    } else {
        alert(`"${activeSongObj.trackName}" is already in your Try-Out Bins.`);
    }
}
