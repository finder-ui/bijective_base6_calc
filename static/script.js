document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Switcher Logic ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const htmlElement = document.documentElement;

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }

    themeSwitcher.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // --- Tab Navigation Logic (FIXED) ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    let tablesData = null; // Cache for the table data

    tabLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent any default button behavior
            const tabId = link.dataset.tab;

            // Update active state on tab links
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show the correct tab content and hide others
            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });

            // Lazy load tables only when the tab is clicked and data hasn't been fetched yet
            if (tabId === 'tab-tables' && !tablesData) {
                const addContainer = document.getElementById('addition-table-container');
                const mulContainer = document.getElementById('multiplication-table-container');
                addContainer.innerHTML = '<p>Loading tables...</p>';
                
                const response = await fetch('/get-tables');
                tablesData = await response.json();

                renderTable(tablesData.header, tablesData.addition, addContainer);
                renderTable(tablesData.header, tablesData.multiplication, mulContainer);
            }
        });
    });

    function renderTable(header, data, container) {
        let tableHTML = '<table><thead><tr><th></th>';
        header.forEach(h => tableHTML += `<th>${h}</th>`);
        tableHTML += '</tr></thead><tbody>';

        data.forEach((row, rowIndex) => {
            tableHTML += `<tr><th>${header[rowIndex]}</th>`;
            row.forEach(cell => tableHTML += `<td>${cell}</td>`);
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    }

    // --- Live Conversion Explorer Logic ---
    const decimalInput = document.getElementById('decimal-input');
    const conversionResults = document.getElementById('conversion-results');

    decimalInput.addEventListener('input', async (e) => {
        const decimalValue = parseInt(e.target.value, 10);
        if (!decimalValue || decimalValue <= 0) {
            conversionResults.innerHTML = '';
            return;
        }
        const response = await fetch('/convert-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decimal_value: decimalValue }),
        });
        const data = await response.json();
        if (data.error) {
            conversionResults.innerHTML = `<div class="error-display">${data.error}</div>`;
        } else {
            conversionResults.innerHTML = `
                <div class="result-grid">
                    <div><strong>Decimal:</strong> <code>${data.decimal}</code></div>
                    <div><strong>Binary:</strong> <code>${data.binary}</code></div>
                    <div><strong>Hexadecimal:</strong> <code>${data.hexadecimal}</code></div>
                    <div><strong>Bijective Base-6:</strong> <code>${data.bijective_base6}</code></div>
                </div>
            `;
        }
    });

    // --- Bijective Calculator Logic ---
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateAllBtn = document.getElementById('calculate-all-btn');
    const resultArea = document.getElementById('result-area');
    const opsResultsGrid = document.getElementById('ops-results-grid');
    const errorDisplay = document.getElementById('error-display');

    calculateAllBtn.addEventListener('click', () => {
        const num1 = num1Input.value.trim();
        const num2 = num2Input.value.trim();
        clearCalculatorResults();
        let hasError = false;
        if (!num1) { triggerShake(num1Input); hasError = true; }
        if (!num2) { triggerShake(num2Input); hasError = true; }

        setTimeout(async () => {
            if (hasError) {
                errorDisplay.textContent = 'Please enter both numbers.';
                resultArea.classList.add('visible');
                return;
            }
            const response = await fetch('/calculate-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ num1, num2 }),
            });
            const data = await response.json();
            if (data.error) {
                errorDisplay.textContent = `Error: ${data.error}`;
            } else {
                displayAllOpsResults(num1, num2, data);
            }
            resultArea.classList.add('visible');
        }, 10);
    });

    function clearCalculatorResults() {
        resultArea.classList.remove('visible');
        opsResultsGrid.innerHTML = '';
        errorDisplay.innerHTML = '';
    }

    function triggerShake(element) {
        element.classList.add('shake');
        setTimeout(() => { element.classList.remove('shake'); }, 500);
    }

    function displayAllOpsResults(num1, num2, data) {
        const ops = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
        for (const opName in data.results) {
            const opData = data.results[opName];
            const resultItem = document.createElement('div');
            resultItem.classList.add('op-result-item');
            
            const problemString = `${num1} ${ops[opName]} ${num2}`;
            const decimalStep = opData.decimal !== null ? `${data.n1_decimal} ${ops[opName]} ${data.n2_decimal} = ${opData.decimal}` : opData.bijective;

            resultItem.innerHTML = `
                <div class="op-title">${opName.charAt(0).toUpperCase() + opName.slice(1)}</div>
                <div class="op-problem">${problemString}</div>
                <div class="op-step">${decimalStep}</div>
                <div class="op-answer">${opData.decimal !== null ? opData.bijective : ''}</div>
            `;
            opsResultsGrid.appendChild(resultItem);
        }
    }
});
