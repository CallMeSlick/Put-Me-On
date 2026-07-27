// ==========================================================================
// SYSTEM THEME & DYNAMIC SESSION ENGINE
// ==========================================================================

const toggleTheme = () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme_preference", isLight ? "light" : "dark");
};

// Check stored theme preference on load
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme_preference");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    checkUserSession();

    // Attach theme toggle click handlers
    const themeBtn = document.getElementById("theme-button");
    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }
});

// Update Header Navigation based on Login Status
function checkUserSession() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const navActions = document.querySelector(".nav-actions");

    if (navActions) {
        if (loggedInUser) {
            const userDisplayName = document.getElementById("user-display-name");
            if (userDisplayName) {
                userDisplayName.textContent = `@${loggedInUser}`;
            }

            navActions.innerHTML = `
                <a href="profile.html" class="nav-pill" style="background-color: #7FDBFF; color: #0d0e12;">👤 Profile</a>
                <a href="index.html#post" class="nav-pill" style="background-color: #b18cff; color: #0d0e12;">➕ Post</a>
                <button id="theme-button" class="nav-pill nav-theme">Theme</button>
                <a href="settings.html" class="nav-pill" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2);" title="Settings">⚙️</a>
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
// SEARCH BAR ENTER REDIRECT
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
        const username = document.getElementById("signin-username").value.trim().toLowerCase();
        const pass = document.getElementById("signin-password").value;
        const errorEl = document.getElementById("auth-error");

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
        const prev = sessionStorage.getItem("previousPage") || "index.html";
        window.location.href = prev === "signin.html" ? "index.html" : prev;
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

        const prev = sessionStorage.getItem("previousPage") || "index.html";
        window.location.href = prev === "signup.html" ? "index.html" : prev;
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
// PROFILE TABS
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

// ==========================================================================
// AUTHOR PICK ADMIN PERMISSIONS (@CallMeSlick ONLY)
// ==========================================================================

window.addEventListener("DOMContentLoaded", () => {
    checkAuthorPermissions();
    loadAuthorPickData();
});

function checkAuthorPermissions() {
    const loggedInUser = (localStorage.getItem("loggedInUser") || "").toLowerCase();
    const editControls = document.getElementById("author-edit-controls");

    // Only allow CallMeSlick to edit the author's pick
    if (loggedInUser === "callmeslick" && editControls) {
        editControls.style.display = "block";
    }
}

function toggleAuthorForm() {
    const form = document.getElementById("author-update-form");
    if (form) {
        form.style.display = form.style.display === "none" ? "flex" : "none";
    }
}

// Load saved Author Pick from localStorage if custom pick exists
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

// Handle Author Pick Update Submission
const authorForm = document.getElementById("author-update-form");
if (authorForm) {
    authorForm.addEventListener("submit", (e) => {
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
        alert("Author's Recommendation updated successfully!");
    });
}
