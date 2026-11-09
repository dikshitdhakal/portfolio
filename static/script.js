document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       1. ELEMENTS AND SETTINGS
    ========================================= */

    const body = document.body;
    const welcomeScreen = document.getElementById("welcomeScreen");
    const enterButton = document.getElementById("enterPortfolio");
    const navbar = document.querySelector(".navbar");

    const INTRO_KEY = "portfolioIntroSeen";
    const EXIT_DELAY = 1000; // must match the welcome-screen CSS transition (1s)

    const forceIntro = new URLSearchParams(window.location.search).has("intro");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasObserver = "IntersectionObserver" in window;


    /* =========================================
       2. SAFE LOCAL STORAGE
    ========================================= */

    function getIntroStatus() {
        try {
            return localStorage.getItem(INTRO_KEY) === "true";
        } catch (error) {
            return false;
        }
    }

    function saveIntroStatus() {
        try {
            localStorage.setItem(INTRO_KEY, "true");
        } catch (error) {
            // Website remains functional without storage.
        }
    }


    /* =========================================
       3. WELCOME SCREEN
    ========================================= */

    // Show the intro (true) or go straight to the portfolio (false)
    function setIntroVisible(show) {
        if (welcomeScreen) {
            welcomeScreen.style.display = show ? "flex" : "none";
            welcomeScreen.classList.remove("exit");
        }

        body.classList.toggle("welcome-active", show);
        body.classList.toggle("portfolio-ready", !show);
        body.style.overflow = show ? "hidden" : "";
    }

    function closeWelcomeScreen() {
        welcomeScreen.classList.add("exit");
        body.classList.remove("welcome-active");
        body.style.overflow = "";

        window.setTimeout(() => {
            welcomeScreen.style.display = "none";
            body.classList.add("portfolio-ready");
            window.scrollTo({ top: 0, behavior: "auto" });
        }, reducedMotion ? 0 : EXIT_DELAY);
    }

    if (welcomeScreen && enterButton) {

        setIntroVisible(forceIntro || !getIntroStatus());

        enterButton.addEventListener("click", () => {
            if (enterButton.disabled) return;

            enterButton.disabled = true;
            enterButton.innerHTML =
                "<span>ENTERING PORTFOLIO...</span>" +
                '<span class="enter-arrow" aria-hidden="true">→</span>';

            saveIntroStatus();
            closeWelcomeScreen();
        });

    } else {
        body.classList.add("portfolio-ready");
        body.style.overflow = "";
    }


    /* =========================================
       4. NAVBAR SCROLL EFFECT
    ========================================= */

    let navbarTicking = false;

    function updateNavbar() {
        navbar?.classList.toggle("scrolled", window.scrollY > 40);
        navbarTicking = false;
    }

    // One update per animation frame instead of one per scroll event
    window.addEventListener("scroll", () => {
        if (navbarTicking) return;
        navbarTicking = true;
        window.requestAnimationFrame(updateNavbar);
    }, { passive: true });

    updateNavbar();


    /* =========================================
       5. SMOOTH NAVIGATION
    ========================================= */

    // One delegated listener covers every in-page link
    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start"
        });
    });


    /* =========================================
       6. SECTION REVEAL ANIMATIONS
    ========================================= */

    const revealElements = document.querySelectorAll(
        ".section-title, .about-box, .interest-grid .card, " +
        ".experience-item, .education-item, " +
        ".skill-group, .project-card, " +
        ".achievement-item, .contact-section > p, .contact"
    );

    revealElements.forEach((element) => element.classList.add("reveal"));

    if (hasObserver && !reducedMotion) {

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        });

        revealElements.forEach((element) => revealObserver.observe(element));

    } else {
        revealElements.forEach((element) => element.classList.add("visible"));
    }


    /* =========================================
       7. HERO ENTRANCE ANIMATION
    ========================================= */

    if (!reducedMotion) {
        document
            .querySelectorAll(".hero-content, .hero-image")
            .forEach((element) => element.classList.add("hero-animate"));
    }


    /* =========================================
       8. AUTOMATIC COPYRIGHT YEAR
    ========================================= */

    const currentYear = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach((element) => {
        element.textContent = currentYear;
    });


    /* =========================================
       9. ACTIVE NAVIGATION LINK
    ========================================= */

    if (hasObserver) {

        const navLinks = document.querySelectorAll(".nav-links a");

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const activeHref = "#" + entry.target.id;

                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === activeHref);
                });
            });
        }, {
            rootMargin: "-30% 0px -60% 0px"
        });

        document
            .querySelectorAll("header[id], section[id]")
            .forEach((section) => sectionObserver.observe(section));

    }


    /* =========================================
       10. TYPING EFFECT (HERO)
    ========================================= */

    const typedElement = document.querySelector(".typed");

    if (typedElement && !reducedMotion) {

        let phrases = [];

        try {
            phrases = JSON.parse(typedElement.dataset.phrases || "[]");
        } catch (error) {
            phrases = [];
        }

        if (phrases.length > 1) {

            const TYPE_SPEED = 90;      // ms per typed letter
            const DELETE_SPEED = 45;    // ms per deleted letter
            const HOLD_TIME = 1800;     // pause on a finished line
            const GAP_TIME = 400;       // pause on an empty line

            let phraseIndex = 0;        // the page starts on phrase 0
            let text = phrases[0];
            let deleting = true;        // so the first move is deleting it

            function typeStep() {
                text = deleting
                    ? text.slice(0, -1)
                    : phrases[phraseIndex].slice(0, text.length + 1);

                typedElement.textContent = text;

                let delay = deleting ? DELETE_SPEED : TYPE_SPEED;

                if (!deleting && text === phrases[phraseIndex]) {
                    deleting = true;
                    delay = HOLD_TIME;
                } else if (deleting && text === "") {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    delay = GAP_TIME;
                }

                window.setTimeout(typeStep, delay);
            }

            // Start once the welcome screen is gone
            function startTyping() {
                window.setTimeout(typeStep, HOLD_TIME);
            }

            if (body.classList.contains("portfolio-ready")) {
                startTyping();
            } else {
                const readyWatcher = new MutationObserver(() => {
                    if (!body.classList.contains("portfolio-ready")) return;
                    readyWatcher.disconnect();
                    startTyping();
                });
                readyWatcher.observe(body, { attributes: true, attributeFilter: ["class"] });
            }

        }

    }

});
