/* -------------------------------------------------------------
   INTERACTIVE SCRIPT FOR AHMAD ZIA HASAN MODARRISI PORTFOLIO
   Handles: Dark/Light Mode, Tab Navigation, Reflection Selectors,
            Skill Filtering (Feature 1), Progress Bar Animations
            (Feature 3), and Floating Scroll Ring (Feature 5).
------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       THEME MANAGEMENT
    ========================================================= */
    const themeToggleBtn = document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
    htmlElement.setAttribute("data-theme", savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("portfolio-theme", newTheme);

        themeToggleBtn.style.transform = "scale(0.85)";
        setTimeout(() => { themeToggleBtn.style.transform = "scale(1)"; }, 150);
    });


    /* =========================================================
       TAB NAVIGATION
    ========================================================= */
    const navLinks = document.querySelectorAll(".nav-link");
    const tabPanes = document.querySelectorAll(".tab-pane");

    function switchTab(tabId) {
        tabPanes.forEach(pane => pane.classList.remove("active"));
        navLinks.forEach(link => link.classList.remove("active"));

        const targetPane = document.getElementById(`${tabId}-tab`);
        if (targetPane) targetPane.classList.add("active");

        const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
        if (targetLink) targetLink.classList.add("active");

        if (window.scrollY > 300) {
            window.scrollTo({ top: 250, behavior: "smooth" });
        }

        // Feature 3: Fire progress bar animation every time CV tab opens
        if (tabId === "cv") {
            fireProgressBars();
        }

        // Clear any active skill filter when leaving the CV tab
        clearSkillFilter();
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = link.getAttribute("data-tab");
            switchTab(tabId);
            history.pushState(null, null, `#${tabId}`);
        });
    });

    const initialHash = window.location.hash.substring(1);
    const validTabs = ["about", "cv", "interview", "reflections"];
    if (initialHash && validTabs.includes(initialHash)) {
        switchTab(initialHash);
    }

    window.switchTab = switchTab;


    /* =========================================================
       STAR REFLECTIONS SUB-NAVIGATION
    ========================================================= */
    const refBtns = document.querySelectorAll(".ref-btn");
    const refPanes = document.querySelectorAll(".ref-pane");

    refBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            refBtns.forEach(b => b.classList.remove("active"));
            refPanes.forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            const refId = btn.getAttribute("data-ref");
            const targetRefPane = document.getElementById(`ref-${refId}`);
            if (targetRefPane) targetRefPane.classList.add("active");
        });
    });


    /* =========================================================
       NAVBAR SCROLL SHADOW & SHRINK
    ========================================================= */
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.style.boxShadow = "var(--shadow-lg)";
            navbar.style.height = "60px";
        } else {
            navbar.style.boxShadow = "var(--shadow-sm)";
            navbar.style.height = "70px";
        }
    });


    /* =========================================================
       FEATURE 3: COMPETENCY PROGRESS BAR ANIMATION
       - Reads target width from data-width attribute
       - Resets to 0 and animates to target every time CV tab opens
    ========================================================= */
    function fireProgressBars() {
        const bars = document.querySelectorAll(".progress[data-width]");
        bars.forEach(bar => {
            // Reset
            bar.style.transition = "none";
            bar.style.width = "0%";
            // Small delay to allow reset to render, then animate
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bar.style.transition = "width 1.1s cubic-bezier(0.22, 1, 0.36, 1)";
                    bar.style.width = bar.getAttribute("data-width");
                });
            });
        });
    }

    // Fire on initial load if CV tab is active on page open
    const cvTabElement = document.getElementById("cv-tab");
    if (cvTabElement && cvTabElement.classList.contains("active")) {
        setTimeout(fireProgressBars, 300);
    }


    /* =========================================================
       FEATURE 1: INTERACTIVE SKILL PILL FILTERING
       - Clicking a skill pill highlights matching timeline items
       - All non-matching pills and timeline items dim out
       - Clicking active pill again clears the filter
    ========================================================= */

    // Skill-to-timeline mapping: pill data-skill → timeline data-skills keyword
    const skillPills = document.querySelectorAll(".skill-pill[data-skill]");
    const timelineItems = document.querySelectorAll(".timeline-item[data-skills]");
    let activeSkill = null;

    function clearSkillFilter() {
        activeSkill = null;
        skillPills.forEach(p => {
            p.classList.remove("is-active", "is-dimmed");
        });
        timelineItems.forEach(item => {
            item.classList.remove("is-highlighted", "is-dimmed");
        });
    }

    skillPills.forEach(pill => {
        pill.addEventListener("click", () => {
            const skill = pill.getAttribute("data-skill");

            // Toggle off if already active
            if (activeSkill === skill) {
                clearSkillFilter();
                return;
            }

            activeSkill = skill;

            // Update pill states
            skillPills.forEach(p => {
                if (p.getAttribute("data-skill") === skill) {
                    p.classList.add("is-active");
                    p.classList.remove("is-dimmed");
                } else {
                    p.classList.add("is-dimmed");
                    p.classList.remove("is-active");
                }
            });

            // Update timeline states
            timelineItems.forEach(item => {
                const itemSkills = item.getAttribute("data-skills").split(" ");
                if (itemSkills.includes(skill)) {
                    item.classList.add("is-highlighted");
                    item.classList.remove("is-dimmed");
                } else {
                    item.classList.add("is-dimmed");
                    item.classList.remove("is-highlighted");
                }
            });
        });
    });


    /* =========================================================
       FEATURE 5: FLOATING BACK-TO-TOP SCROLL PROGRESS RING
       - SVG circle ring fills up proportionally to scroll depth
       - Button appears only after scrolling 300px
       - Clicking scrolls back to the very top smoothly
    ========================================================= */
    const scrollBtn = document.getElementById("scroll-top-btn");
    const ringFill = document.getElementById("ring-fill");

    // Inject SVG gradient definition dynamically
    const svgNS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(svgNS, "defs");
    const grad = document.createElementNS(svgNS, "linearGradient");
    grad.setAttribute("id", "ringGradient");
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "0%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#818CF8");

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#22D3EE");

    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    document.querySelector(".scroll-ring").appendChild(defs);

    // Circumference of circle: 2 * π * r = 2 * π * 15.9155 ≈ 100
    const CIRCUMFERENCE = 100;

    function updateScrollRing() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        const filled = progress * CIRCUMFERENCE;

        // Update the ring fill stroke-dasharray
        ringFill.setAttribute("stroke-dasharray", `${filled.toFixed(2)} ${CIRCUMFERENCE}`);

        // Show/hide the button
        if (scrollTop > 300) {
            scrollBtn.classList.add("visible");
        } else {
            scrollBtn.classList.remove("visible");
        }
    }

    window.addEventListener("scroll", updateScrollRing, { passive: true });

    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Initialize on load
    updateScrollRing();
});
