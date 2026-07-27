// ==========================================================================
// SYSTEM THEME & DYNAMIC SESSION ENGINE
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

    checkUserSession();
    checkAuthorPermissions();
    loadAuthorPickData();
    updateProfileStats();
    initSocialListPage();

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
            const userDisplayName = document.getElementById("user-display-name");
            if (userDisplayName) {
                userDisplayName.textContent = `@${loggedInUser}`;
            }

            let settingsGear = !isAuthPage ? `<a href="settings.html" class="nav-pill" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2);" title="Settings">⚙️</a>` : '';

            navActions.innerHTML = `
                <a href="profile.html" class="nav-pill" style="background-color: #7FDBFF; color: #0d0e12;">👤 Profile</a>
                <a href="index.html#post" class="nav-pill" style="background-color: #b18cff; color: #0d0e12;">➕ Post</a>
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
// SEARCH BAR
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
// AUTHENTICATION LOGIC (SIGN IN, SIGN UP, FORGOT PASSWORD)
// ==========================================================================

// 1. SIGN IN
const signinForm = document.getElementById("signin-form");
if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById("signin-username");
        const passwordInput = document.getElementById("signin-password");
        const errorEl = document.getElementById("auth-error");

        if (!usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim().toLowerCase();
        const pass = passwordInput.value;

        const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");

        if (!users[username] || users[username].pass !== pass) {
            if (errorEl) {
                errorEl.textContent = "Error: Invalid username or password!";
                errorEl.style.display = "block";
            } else {
                alert("Invalid username or password!");
            }
            return;
        }

        localStorage.setItem("loggedInUser", username);
        window.location.href = "profile.html";
    });
}

// 2. SIGN UP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("signup-username").value.trim().toLowerCase();
        const email = document.getElementById("signup-email").value.trim();
        const pass = document.getElementById("signup-password").value;
        const confirmPass = document.getElementById("signup-password-confirm").value;
        const errorEl = document.getElementById("signup-error");

        const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");

        if (users[username]) {
            if (errorEl) {
                errorEl.textContent = "Error: Username already taken!";
                errorEl.style.display = "block";
            }
            return;
        }

        if (pass !== confirmPass) {
            if (errorEl) {
                errorEl.textContent = "Error: Passwords do not match!";
                errorEl.style.display = "block";
            }
            return;
        }

        users[username] = { email, pass };
        localStorage.setItem("pmo_users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", username);

        alert("Account created successfully! Redirecting to profile...");
        window.location.href = "profile.html";
    });
}

// 3. FORGOT PASSWORD
const forgotEmailForm = document.getElementById("forgot-email-form");
let resetUsername = null;

if (forgotEmailForm) {
    forgotEmailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("forgot-email").value.trim();
        const errorEl = document.getElementById("forgot-error");
        const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");

        resetUsername = Object.keys(users).find(u => users[u].email === email);

        if (!resetUsername) {
            if (errorEl) {
                errorEl.textContent = "Error: Email address not found!";
                errorEl.style.display = "block";
            }
            return;
        }

        document.getElementById("forgot-step-1").style.display = "none";
        document.getElementById("forgot-step-2").style.display = "block";
    });
}

const resetPasswordForm = document.getElementById("reset-password-form");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newPass = document.getElementById("new-password").value;
        const confirmPass = document.getElementById("confirm-new-password").value;
        const errorEl = document.getElementById("reset-error");

        if (newPass !== confirmPass) {
            if (errorEl) {
                errorEl.textContent = "Error: Passwords do not match!";
                errorEl.style.display = "block";
            }
            return;
        }

        const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");
        if (resetUsername && users[resetUsername]) {
            users[resetUsername].pass = newPass;
            localStorage.setItem("pmo_users", JSON.stringify(users));
        }

        alert("Password updated successfully! Please sign in.");
        window.location.href = "signin.html";
    });
}

// ==========================================================================
// PROFILE TABS & STATS
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
// AUTHOR PICK ADMIN PERMISSIONS (@CallMeSlick / @Callmesiick)
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
            </
