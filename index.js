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
    checkAuthorPermissions();
    loadAuthorPickData();
    updateProfileStats();
    initSocialListPage();

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
        const prev = sessionStorage.getItem("previousPage") || "index.html";
        window.location.href = (prev === "signin.html" || prev === "signup.html") ? "index.html" : prev;
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
        const confirmPass = document
