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

    const semBtns = document.querySelectorAll("[data-sem-go]");
    const navGroups = document.querySelectorAll(".nav-links[data-semester]");
    const headerEl = document.getElementById("site-header");

    // Keep a CSS variable in sync with the real (variable-height) header
    function syncHeaderHeight() {
        document.documentElement.style.setProperty("--header-h", headerEl.offsetHeight + "px");
    }
    syncHeaderHeight();
    window.addEventListener("resize", syncHeaderHeight);
    if (window.ResizeObserver) new ResizeObserver(syncHeaderHeight).observe(headerEl);

    function setSemester(sem) {
        semBtns.forEach(b => b.classList.toggle("active", b.dataset.semGo === sem));
        navGroups.forEach(g => { g.hidden = g.dataset.semester !== sem; });
        syncHeaderHeight();
    }

    function scrollToContent() {
        const target = document.querySelector(".container-content");
        const top = target.getBoundingClientRect().top + window.scrollY - headerEl.offsetHeight - 16;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    }

    function switchTab(tabId, opts) {
        const scroll = !opts || opts.scroll !== false;
        tabPanes.forEach(pane => pane.classList.remove("active"));
        navLinks.forEach(link => link.classList.remove("active"));

        const targetPane = document.getElementById(`${tabId}-tab`);
        if (targetPane) {
            targetPane.classList.add("active");
            setSemester(targetPane.dataset.semester || "1");
        }

        const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
        if (targetLink) {
            targetLink.classList.add("active");
            // keep the active tab visible in the scrollable sub-navigation on small screens
            targetLink.scrollIntoView({ block: "nearest", inline: "center" });
        }

        if (scroll) scrollToContent();

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

    // Logo goes home (Semester 1, About)
    document.querySelectorAll("[data-tab-link]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab(el.dataset.tabLink);
            history.pushState(null, null, `#${el.dataset.tabLink}`);
        });
    });


    window.switchTab = switchTab;

    // Semester buttons (top bar and the two big cards): jump to the first tab of that semester
    semBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const first = btn.dataset.semGo === "2" ? "charter" : "about";
            switchTab(first);
            history.pushState(null, null, `#${first}`);
        });
    });

    // Breadcrumb at the top and Previous / Next at the bottom of every section
    const sectionOrder = Array.from(document.querySelectorAll("#nav-s1 .nav-link, #nav-s2 .nav-link")).map(a => ({
        id: a.dataset.tab,
        title: a.textContent.trim(),
        sem: a.closest(".nav-links").dataset.semester
    }));
    sectionOrder.forEach((sec, i) => {
        const pane = document.getElementById(`${sec.id}-tab`);
        if (!pane) return;
        const inSem = sectionOrder.filter(s => s.sem === sec.sem);
        const pos = inSem.findIndex(s => s.id === sec.id) + 1;

        const crumb = document.createElement("div");
        crumb.className = "crumb";
        crumb.innerHTML = `<span class="crumb-sem">Semester ${sec.sem}</span><span class="crumb-sep">/</span><strong>${sec.title}</strong><span class="crumb-step">${pos} of ${inSem.length}</span>`;
        pane.insertBefore(crumb, pane.firstChild);

        const pager = document.createElement("div");
        pager.className = "pager";
        const mk = (target, dir) => {
            if (!target) return '<span></span>';
            const cross = target.sem !== sec.sem ? `Semester ${target.sem} · ` : "";
            const arrow = dir === "prev" ? '<i class="fa-solid fa-arrow-left"></i>' : '<i class="fa-solid fa-arrow-right"></i>';
            return `<button type="button" class="pager-btn pager-${dir}" data-go="${target.id}">` +
                (dir === "prev" ? arrow : "") +
                `<span><small>${dir === "prev" ? "Previous" : "Next"}</small>${cross}${target.title}</span>` +
                (dir === "next" ? arrow : "") + `</button>`;
        };
        pager.innerHTML = mk(sectionOrder[i - 1], "prev") + mk(sectionOrder[i + 1], "next");
        pane.appendChild(pager);
    });
    document.querySelectorAll(".pager-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchTab(btn.dataset.go);
            history.pushState(null, null, `#${btn.dataset.go}`);
        });
    });


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
        } else {
            navbar.style.boxShadow = "var(--shadow-sm)";
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

    // Open the tab named in the URL hash (runs last so every helper above is defined)
    const initialHash = window.location.hash.substring(1);
    const validTabs = Array.from(tabPanes).map(p => p.id.replace(/-tab$/, ""));
    if (initialHash && validTabs.includes(initialHash)) {
        switchTab(initialHash, { scroll: false });
    }
});
