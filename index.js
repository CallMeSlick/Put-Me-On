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

themeButton.addEventListener("click", toggleTheme);

window.addEventListener("DOMContentLoaded", () => {
    detectSystemTheme();
    reveal();
});


// =========================
// PETITION & OBJECT REFACTOR
// =========================
const signButton = document.getElementById("sign-now-button");
let signatureCount = 3;

// Refactored to accept a person object
const addSignature = (person) => {
    const signatures = document.querySelector(".signatures");
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
    const petitionInputs = document.getElementById("sign-petition").elements;

    for (let i = 0; i < petitionInputs.length; i++) {
        if (petitionInputs[i].value.length < 2) {
            petitionInputs[i].classList.add("error");
            containsErrors = true;
        } else {
            petitionInputs[i].classList.remove("error");
        }
    }

    const email = document.getElementById("email");
    if (!email.value.includes(".com")) {
        email.classList.add("error");
        containsErrors = true;
    }

    if (containsErrors === false) {
        // Step 1: Refactor to create a person object
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

signButton.addEventListener("click", validateForm);


// =========================
// MODAL ANIMATION & TIMERS
// =========================
const modal = document.getElementById("thanks-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalImg = document.getElementById("modal-img");
let modalTimeoutId;
let intervalId;

// Animates image transformation using setInterval
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
        modalImg.style.transform = `scale(${scale}) rotate(${scale * 8 - 8}deg)`;
    }, 80);
};

// Opens modal, displays thank you text, and sets automatic timeout
const toggleModal = (person) => {
    const thanksText = document.getElementById("thanks-modal-content");
    thanksText.textContent = `Thank you so much, ${person.name}!`;

    modal.style.display = "flex";
    animateImage();

    // Automatically hide modal after 4 seconds
    modalTimeoutId = setTimeout(() => {
        closeModal();
    }, 4000);
};

// Closes modal and clears running timers
const closeModal = () => {
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