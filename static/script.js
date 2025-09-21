document.addEventListener("DOMContentLoaded", () => {
    const htmlElement = document.documentElement;

    // --- Configurations ---
    const SUPPORTED_LANGS = {
        en: { flag: "🇺🇸", name: "English" },
        ru: { flag: "🇷🇺", name: "Русский" },
        he: { flag: "🇮🇱", name: "עברית" },
        es: { flag: "🇪🇸", name: "Español" },
        fr: { flag: "🇫🇷", name: "Français" },
        de: { flag: "🇩🇪", name: "Deutsch" },
        ar: { flag: "🇸🇦", name: "العربية" }
    };
    const RTL_LANGS = ["he", "ar"];
    const OPS_MAP = { addition: "+", subtraction: "-", multiplication: "×", division: "÷" };

    // --- Utilities ---
    async function safeFetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error(`Fetch failed: ${url}`, err);
            return null;
        }
    }

    function qs(selector) {
        return document.querySelector(selector);
    }

    function qsa(selector) {
        return document.querySelectorAll(selector);
    }

    function setAttr(el, attr, val) {
        if (el) el.setAttribute(attr, val);
    }

    function clearElement(el) {
        if (el) el.innerHTML = "";
    }

    // --- Internationalization ---
    async function setLanguage(lang) {
        if (!SUPPORTED_LANGS[lang]) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        const langData = await safeFetch(`/locales/${lang}.json`);
        if (!langData) return;

        applyTranslations(langData);
        htmlElement.lang = lang;
        htmlElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

        localStorage.setItem("language", lang);
        updateLangSwitcherUI(lang);
    }

    function applyTranslations(data) {
        qsa("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (data[key] !== undefined) el.innerHTML = data[key];
        });
        qsa("[data-i18n-placeholder]").forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (data[key] !== undefined) el.placeholder = data[key];
        });
        qsa("[data-i18n-aria-label]").forEach(el => {
            const key = el.dataset.i18nAriaLabel;
            if (data[key] !== undefined) el.setAttribute("aria-label", data[key]);
        });
    }

    function setupLangSwitcher() {
        const container = qs("#lang-switcher-container");
        if (!container) return;
        clearElement(container);

        Object.entries(SUPPORTED_LANGS).forEach(([code, { flag, name }]) => {
            const btn = document.createElement("span");
            btn.className = "lang-btn";
            btn.textContent = flag;
            btn.dataset.lang = code;
            btn.role = "button";
            btn.ariaLabel = `Switch to ${name}`;
            container.appendChild(btn);
        });

        container.addEventListener("click", e => {
            const btn = e.target.closest(".lang-btn");
            if (btn?.dataset.lang) setLanguage(btn.dataset.lang);
        });
    }

    function updateLangSwitcherUI(lang) {
        qsa(".lang-btn").forEach(btn =>
            btn.classList.toggle("active", btn.dataset.lang === lang)
        );
    }

    // --- Theme Switcher ---
    function setTheme(theme) {
        htmlElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);
        const switcher = qs("#theme-switcher");
        if (switcher) switcher.innerHTML = theme === "dark" ? "☀️" : "🌙";
    }

    function setupThemeSwitcher() {
        const switcher = qs("#theme-switcher");
        if (!switcher) return;
        switcher.addEventListener("click", () => {
            const current = htmlElement.dataset.theme || "light";
            setTheme(current === "dark" ? "light" : "dark");
        });
    }

    // --- Tables ---
    function renderTable(header, rows, container) {
        if (!container) return;
        let html = `<table class="table table-bordered table-hover"><thead><tr><th>#</th>`;
        header.forEach(h => (html += `<th>${h}</th>`));
        html += "</tr></thead><tbody>";
        rows.forEach((row, i) => {
            html += `<tr><th>${header[i]}</th>`;
            row.forEach(cell => (html += `<td>${cell}</td>`));
            html += "</tr>";
        });
        html += "</tbody></table>";
        container.innerHTML = html;
    }

    function setupTablesTab() {
        const tab = qs("#tables-tab");
        if (!tab) return;
        let loaded = false;

        tab.addEventListener("shown.bs.tab", async () => {
            if (loaded) return;
            const addC = qs("#addition-table-container");
            const mulC = qs("#multiplication-table-container");
            if (addC) addC.innerHTML = "<p class='text-center'>Loading...</p>";

            const data = await safeFetch("/get-tables");
            if (!data) return;

            renderTable(data.header, data.addition, addC);
            renderTable(data.header, data.multiplication, mulC);
            loaded = true;
        });
    }

    // --- Converter ---
    function setupConverter() {
        const input = qs("#decimal-input");
        const results = qs("#conversion-results");
        if (!input || !results) return;

        input.addEventListener("input", async e => {
            const val = parseInt(e.target.value, 10);
            if (!val || val <= 0) {
                results.innerHTML = "";
                return;
            }

            const data = await safeFetch("/convert-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decimal_value: val })
            });

            if (!data) return;
            results.innerHTML = data.error
                ? `<div class="text-danger">${data.error}</div>`
                : `
                <div class="result-grid">
                    <div><strong>Decimal:</strong> <code>${data.decimal}</code></div>
                    <div><strong>Binary:</strong> <code>${data.binary}</code></div>
                    <div><strong>Hexadecimal:</strong> <code>${data.hexadecimal}</code></div>
                    <div><strong>Bijective Base-6:</strong> <code>${data.bijective_base6}</code></div>
                </div>`;
        });
    }

    // --- Calculator ---
    function triggerShake(el) {
        if (!el) return;
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 500);
    }

    function clearCalculatorResults(area, grid, errorEl) {
        if (area) area.classList.remove("visible");
        if (grid) grid.innerHTML = "";
        if (errorEl) errorEl.innerHTML = "";
    }

    function displayAllOpsResults(num1, num2, data, grid) {
        if (!grid) return;
        grid.innerHTML = "";

        for (const [opName, opData] of Object.entries(data.results || {})) {
            const resultItem = document.createElement("div");
            resultItem.classList.add("col");

            const problemBijective = `${num1} ${OPS_MAP[opName]} ${num2}`;
            const decimalStep =
                opData.decimal !== null
                    ? `${data.n1_decimal} ${OPS_MAP[opName]} ${data.n2_decimal} = ${opData.decimal}`
                    : opData.bijective;

            resultItem.innerHTML = `
                <div class="op-result-item h-100">
                    <div class="op-title">${opName[0].toUpperCase() + opName.slice(1)}</div>
                    <div class="op-problem">${problemBijective}</div>
                    <div class="op-step">${decimalStep}</div>
                    <div class="op-answer">${opData.decimal !== null ? opData.bijective : "&nbsp;"}</div>
                </div>`;
            grid.appendChild(resultItem);
        }
    }

    function setupCalculator() {
        const num1 = qs("#num1");
        const num2 = qs("#num2");
        const btn = qs("#calculate-all-btn");
        const area = qs("#result-area");
        const grid = qs("#ops-results-grid");
        const errorEl = qs("#error-display");

        if (!btn || !num1 || !num2) return;

        btn.addEventListener("click", () => {
            clearCalculatorResults(area, grid, errorEl);
            const val1 = num1.value.trim();
            const val2 = num2.value.trim();

            let hasError = false;
            if (!val1) { triggerShake(num1); hasError = true; }
            if (!val2) { triggerShake(num2); hasError = true; }

            setTimeout(async () => {
                if (hasError) {
                    if (errorEl) errorEl.textContent = "Please enter both numbers.";
                    if (area) area.classList.add("visible");
                    return;
                }

                const data = await safeFetch("/calculate-all", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ num1: val1, num2: val2 })
                });
                if (!data) return;

                if (data.error) {
                    if (errorEl) errorEl.textContent = `Error: ${data.error}`;
                } else {
                    displayAllOpsResults(val1, val2, data, grid);
                }
                if (area) area.classList.add("visible");
            }, 10);
        });
    }

    // --- Initialize ---
    setupLangSwitcher();
    setupThemeSwitcher();
    setupTablesTab();
    setupConverter();
    setupCalculator();

    setLanguage(localStorage.getItem("language") || "en");
    setTheme(localStorage.getItem("theme") || "dark");
});
