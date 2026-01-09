// Gemeenschappelijke Reveal.js initialisatie voor MOZa presentaties

function initReveal(options = {}) {
    const defaultOptions = {
        plugins: [RevealNotes, RevealHighlight],
        controls: false,
    };

    const config = { ...defaultOptions, ...options };
    const defaultControls = config.controls;
    Reveal.initialize(config);

    // Logo tonen/verbergen op basis van slide class
    Reveal.on("slidechanged", function (event) {
        const logo = document.getElementById("header-logo");
        if (logo) {
            if (event.currentSlide.classList.contains("hide-logo")) {
                logo.classList.add("logo-hidden");
            } else {
                logo.classList.remove("logo-hidden");
            }
        }

        // Toggle controls op basis van slide class, val terug naar default
        if (event.currentSlide.classList.contains("hide-controls")) {
            Reveal.configure({ controls: false });
        } else if (event.currentSlide.classList.contains("show-controls")) {
            Reveal.configure({ controls: true });
        } else {
            Reveal.configure({ controls: defaultControls });
        }
    });

    // Check initial slide
    Reveal.on("ready", function (event) {
        const logo = document.getElementById("header-logo");
        if (logo && event.currentSlide.classList.contains("hide-logo")) {
            logo.classList.add("logo-hidden");
        }

        if (event.currentSlide.classList.contains("show-controls")) {
            Reveal.configure({ controls: true });
        }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", function (event) {
        // 'i' voor index pagina
        if (event.key === "i" || event.key === "I") {
            window.location.href = "/";
        }
    });

    // Spacebar voor video pause/play (capture fase om vóór Reveal.js te komen)
    document.addEventListener(
        "keydown",
        function (event) {
            if (event.code === "Space") {
                const currentSlide = Reveal.getCurrentSlide();
                const video = currentSlide.querySelector("video");

                if (video) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            }
        },
        true,
    );

    // Video playback bij slide change
    Reveal.on("slidechanged", function (event) {
        const video = event.currentSlide.querySelector("video[data-start-time]");
        if (video) {
            const startTime = parseFloat(video.getAttribute("data-start-time"));
            video.currentTime = startTime;
            video.play();
        } else {
            // Pause videos op andere slides
            const allVideos = document.querySelectorAll("video");
            allVideos.forEach((v) => v.pause());
        }
    });

    // Video fallback: toon afbeelding als video niet beschikbaar is
    document.querySelectorAll("video").forEach(function (video) {
        video.addEventListener("error", function () {
            const fallback = video.parentElement.querySelector(".video-fallback");
            if (fallback) {
                video.style.display = "none";
                fallback.style.display = "block";
                fallback.style.margin = "0 auto";
            }
        });
    });
}
