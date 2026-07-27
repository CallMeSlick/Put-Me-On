// ==========================================================================
// SYSTEM THEME & PERSISTENT SESSION ENGINE
// ==========================================================================

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

window.addEventListener("DOMContentLoaded", () => {
    detectSystemTheme();
    checkUserSession();
    
    // Save current page location for authentication redirects
    const currentPage = window.location.pathname.split("/").pop();
    if (!["signin.html", "signup.html", "forgot-password.html"].includes(currentPage) && currentPage !== "") {
        sessionStorage.setItem("previousPage", currentPage);
    }
});

// Update navbar depending on user sign-in status
function checkUserSession() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const navActions = document.querySelector(".nav-actions");
    const currentPage = window.location.pathname.split("/").pop();

    const isAuthPage = ["signin.html", "signup.html", "forgot-password.html"].includes(currentPage);

    if (loggedInUser && navActions) {
        // Automatically set user display name on profile page if open
        const userDisplayName = document.getElementById("user-display-name");
        if (userDisplayName) {
            userDisplayName.textContent = `@${loggedInUser}`;
        }

        let settingsGear = !isAuthPage ? `<a href="settings.html" class="nav-pill" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2);" title="Settings">⚙️</a>` : '';
        
        navActions.innerHTML = `
            <a href="profile.html" class="nav-pill" style="background-color: #7FDBFF; color: #0d0e12;">👤 Profile</a>
            <a href="index.html#post" class="nav-pill" style="background-color: #b18cff; color: #0d0e12;">➕ Post</a>
            ${settingsGear}
            <button id="theme-button" class="nav-pill nav-theme">Theme</button>
        `;
        
        const themeBtn = document.getElementById("theme-button");
        if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    }
}

function signOutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}


// ==========================================================================
// SEARCH BAR NAVIGATION
// ==========================================================================

const searchInput = document.getElementById("music-search");

if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim().length > 0) {
            window.location.href = `search.html?query=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}


// ==========================================================================
// AUTHENTICATION ENGINE (SIGN IN, SIGN UP, FORGOT PASSWORD)
// ==========================================================================

// 1. SIGN UP LOGIC
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
            errorEl.textContent = "Error: That username is already taken! Please pick another.";
            errorEl.style.display = "block";
            return;
        }

        if (pass !== confirmPass) {
            errorEl.textContent = "Error: Passwords do not match!";
            errorEl.style.display = "block";
            return;
        }

        users[username] = { email, pass };
        localStorage.setItem("pmo_users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", username);

        const prev = sessionStorage.getItem("previousPage") || "index.html";
        window.location.href = prev === "signin.html" ? "index.html" : prev;
    });
}

// 2. SIGN IN LOGIC
const signinForm = document.getElementById("signin-form");
if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("signin-username").value.trim().toLowerCase();
        const pass = document.getElementById("signin-password").value;
        const errorEl = document.getElementById("auth-error");

        const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");

        if (!users[username] || users[username].pass !== pass) {
            errorEl.textContent = "Error: Invalid username or password!";
            errorEl.style.display = "block";
            return;
        }

        localStorage.setItem("loggedInUser", username);
        const prev = sessionStorage.getItem("previousPage") || "index.html";
        window.location.href = prev === "signin.html" ? "index.html" : prev;
    });
}

// 3. FORGOT PASSWORD LOGIC
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
            errorEl.textContent = "Error: No account found with that email address!";
            errorEl.style.display = "block";
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
            errorEl.textContent = "Error: Passwords do not match!";
            errorEl.style.display = "block";
            return;
        }

        const users = JSON.parse(localStorage.getItem("pmo_users") || "{}");
        if (resetUsername && users[resetUsername]) {
            users[resetUsername].pass = newPass;
            localStorage.setItem("pmo_users", JSON.stringify(users));
        }

        alert("Password updated successfully! Please sign in with your new password.");
        window.location.href = "signin.html";
    });
}


// ==========================================================================
// PROFILE TABS & CUSTOMIZATIONS
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

// Profile picture upload reader
const pfpInput = document.getElementById("pfp-file-input");
if (pfpInput) {
    pfpInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const base64Img = evt.target.result;
                localStorage.setItem("user_pfp", base64Img);
                const pfpPreview = document.getElementById("settings-pfp-preview");
                if (pfpPreview) pfpPreview.src = base64Img;
                alert("Profile picture updated!");
            };
            reader.readAsDataURL(file);
        }
    });
}

// Load custom profile picture if present
window.addEventListener("DOMContentLoaded", () => {
    const savedPfp = localStorage.getItem("user_pfp");
    if (savedPfp) {
        const pfpPreview = document.getElementById("settings-pfp-preview");
        const userPfp = document.getElementById("user-pfp");
        if (pfpPreview) pfpPreview.src = savedPfp;
        if (userPfp) userPfp.src = savedPfp;
    }
});
