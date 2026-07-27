// ==========================================================================
// REAL-TIME GLOBAL MUSIC SEARCH ENGINE (ALL ARTISTS & SONGS)
// ==========================================================================

let currentSearchFilter = "all";
let activeSearchQuery = "";
let fetchedSearchResults = {
    songs: [],
    albums: [],
    artists: [],
    playlists: []
};

// ==========================================================================
// PROFILE PLAYLIST SUB-TAB SWITCHER
// ==========================================================================

function switchPlaylistSubTab(serviceName) {
    const titleEl = document.getElementById("playlist-service-title");
    const promptEl = document.getElementById("playlist-connect-prompt");

    const btnSpotify = document.getElementById("sub-btn-spotify");
    const btnITunes = document.getElementById("sub-btn-itunes");
    const btnYouTube = document.getElementById("sub-btn-youtube");

    // Remove active style from all sub buttons
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

    // Call the real-time music API
    fetchGlobalMusicData(activeSearchQuery);
}

async function fetchGlobalMusicData(query) {
    const labelEl = document.getElementById("search-query-label");
    const container = document.getElementById("search-results-container");

    try {
        // Query the global iTunes / Apple Music search API for any artist or track
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=25&entity=song,album,musicArtist`);
        const data = await response.json();

        // Separate raw API results into Songs, Albums, and Artists
        fetchedSearchResults.songs = [];
        fetchedSearchResults.albums = [];
        fetchedSearchResults.artists = [];
        fetchedSearchResults.playlists = []; // Simulated community playlists matching query

        data.results.forEach(item => {
            if (item.wrapperType === "track") {
                fetchedSearchResults.songs.push({
                    id: item.trackId,
                    title: item.trackName,
                    artist: item.artistName,
                    album: item.collectionName,
                    cover: item.artworkUrl100.replace("100x100bb", "300x300bb")
                });
            } else if (item.wrapperType === "collection") {
                fetchedSearchResults.albums.push({
                    id: item.collectionId,
                    title: item.collectionName,
                    artist: item.artistName,
                    year: new Date(item.releaseDate).getFullYear(),
                    cover: item.artworkUrl100.replace("100x100bb", "300x300bb")
                });
            } else if (item.wrapperType === "artist") {
                fetchedSearchResults.artists.push({
                    id: item.artistId,
                    name: item.artistName,
                    genre: item.primaryGenreName || "Music",
                    image: "PutMeOnMascot.png"
                });
            }
        });

        // Add matching community playlist
        fetchedSearchResults.playlists.push({
            id: `pl-${Date.now()}`,
            title: `Essential ${query} Mix`,
            creator: "CallMeSlick",
            songsCount: 20,
            cover: "PutMeOnLogo.png"
        });

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

    // --- 1. SONGS ---
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

    // --- 2. ALBUMS ---
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

    // --- 3. ARTISTS ---
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

    // --- 4. PLAYLISTS ---
    if ((currentSearchFilter === 'all' || currentSearchFilter === 'playlists') && fetchedSearchResults.playlists.length > 0) {
        hasAnyResults = true;
        const section = document.createElement("div");
        section.innerHTML = `<h3 style="color: #1DB954; margin-bottom: 12px; text-align: left;">🎧 Playlists</h3>`;

        fetchedSearchResults.playlists.forEach(pl => {
            const card = document.createElement("div");
            card.className = "search-result-card";
            card.onclick = () => window.location.href = `playlist.html?id=${pl.id}`;
            card.innerHTML = `
                <img src="${pl.cover}" alt="${pl.title}">
                <div>
                    <strong>${pl.title}</strong><br>
                    <small style="color: #a0aec0;">Curated by @${pl.creator} • ${pl.songsCount} tracks</small>
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
