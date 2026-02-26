document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recommendationForm');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('resultsSection');
    const analyticsSection = document.getElementById('analyticsSection');
    const phoneGrid = document.getElementById('phoneGrid');
    const tabs = document.querySelectorAll('.tab');

    let allResults = null;
    let matchChart = null;
    let marketChart = null;

    // Form Submission Handling
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect preferences
        const preferences = {
            priceRange: parseInt(document.getElementById('priceRange').value),
            ram: parseInt(document.getElementById('ram').value),
            display: document.getElementById('display').value,
            refreshRate: parseInt(document.getElementById('refreshRate').value),
            chargingSpeed: parseInt(document.getElementById('chargingSpeed').value),
            camera: parseInt(document.getElementById('camera').value),
            require5G: document.getElementById('require5G').checked,
            brand: document.getElementById('brand').value,
            storage: parseInt(document.getElementById('storage').value),
            battery: parseInt(document.getElementById('battery').value)
        };

        // UI State: Loading
        loader.style.display = 'block';
        resultsSection.style.display = 'none';
        analyticsSection.style.display = 'none';
        phoneGrid.innerHTML = '';

        try {
            const response = await fetch('/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) throw new Error('Failed to fetch recommendations');

            allResults = await response.json();

            // Render initial tab (Best Matches)
            renderResults('best_matches');

            // Initialize Charts
            initCharts(allResults);

            // UI State: Results
            loader.style.display = 'none';
            resultsSection.style.display = 'block';
            resultsSection.classList.add('active');
            analyticsSection.style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            loader.style.display = 'none';
            alert('Something went wrong. Please check your connection and try again.');
        }
    });

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderResults(tab.dataset.category);
        });
    });

    function renderResults(category) {
        const phones = allResults[category] || [];
        phoneGrid.innerHTML = '';

        if (phones.length === 0) {
            phoneGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No matches found in this category.</p>';
            return;
        }

        phones.forEach((phone, index) => {
            const card = document.createElement('div');
            card.className = 'phone-card';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                ${phone.match_percentage ? `<div class="match-badge">${phone.match_percentage}% Match</div>` : ''}
                <h3>${phone.name}</h3>
                <span class="brand">${phone.brand} ${phone.build_quality === 'Premium' ? '<span class="tag-premium">PREMIUM BUILD</span>' : ''}</span>
                <div class="price">₹${phone.price.toLocaleString('en-IN')}</div>
                
                <div class="specs-grid">
                    <div class="spec-item"><i class="fas fa-microchip"></i> ${phone.chipset_score}/100</div>
                    <div class="spec-item"><i class="fas fa-memory"></i> ${phone.ram}GB RAM</div>
                    <div class="spec-item"><i class="fas fa-camera"></i> ${phone.camera}MP</div>
                    <div class="spec-item"><i class="fas fa-battery-full"></i> ${phone.battery}mAh</div>
                    <div class="spec-item"><i class="fas fa-mobile-alt"></i> ${phone.display}</div>
                    <div class="spec-item"><i class="fas fa-bolt"></i> ${phone.charging_w}W</div>
                </div>

                ${phone.is_5g ? '<span class="tag-5g">5G CONNECTED</span>' : ''}
                <div class="value-score">Value Score: ${phone.value_score}</div>
            `;
            phoneGrid.appendChild(card);
        });
    }

    function initCharts(data) {
        const topMatch = data.best_matches[0];
        if (!topMatch) return;

        // Cleanup existing charts
        if (matchChart) matchChart.destroy();
        if (marketChart) marketChart.destroy();

        // 1. Radar Chart: Tech Match Profile
        const ctxMatch = document.getElementById('matchChart').getContext('2d');
        matchChart = new Chart(ctxMatch, {
            type: 'radar',
            data: {
                labels: ['Performance', 'Camera', 'Battery', 'Display', 'Charging', 'Value'],
                datasets: [{
                    label: topMatch.name,
                    data: [
                        topMatch.chipset_score,
                        (topMatch.camera / 2), // Normalized for 100-base
                        (topMatch.battery / 60),
                        topMatch.display === 'AMOLED' ? 100 : (topMatch.display === 'OLED' ? 80 : 40),
                        (topMatch.charging_w / 1.25),
                        topMatch.value_score * 2
                    ],
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38bdf8',
                    pointBackgroundColor: '#38bdf8',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f8fafc' } }
                }
            }
        });

        // 2. Bar Chart: Market Value Analysis
        const valPicks = data.value_picks;
        const ctxMarket = document.getElementById('marketChart').getContext('2d');
        marketChart = new Chart(ctxMarket, {
            type: 'bar',
            data: {
                labels: valPicks.map(p => p.name.split(' ').slice(-1)),
                datasets: [{
                    label: 'Value Score (High is Better)',
                    data: valPicks.map(p => p.value_score),
                    backgroundColor: [
                        'rgba(129, 140, 248, 0.6)',
                        'rgba(56, 189, 248, 0.6)',
                        'rgba(34, 197, 94, 0.6)'
                    ],
                    borderColor: ['#818cf8', '#38bdf8', '#22c55e'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});
