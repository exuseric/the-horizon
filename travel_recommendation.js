// --- Shared Logic ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from immediately closing it
        navLinks.classList.toggle('active');
        console.log('Menu toggled. Active:', navLinks.classList.contains('active'));
        // Update icon based on state
        const isOpen = navLinks.classList.contains('active');
        navToggle.innerHTML = isOpen 
            ? `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
            : `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });
}

// Close mobile menu on click outside or on link click
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
        }
    }
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else if (navbar) {
        navbar.classList.remove('scrolled');
    }
});

// Search Logic (Handling redirects and results)
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = document.getElementById('searchInput').value.trim();
        if (keyword) {
            window.location.href = `results.html?keyword=${encodeURIComponent(keyword)}`;
        }
    });
}

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        if (window.location.pathname.includes('results.html')) {
            window.location.href = 'travel_recommendation.html';
        }
    });
}

// Active Nav Link highlight
const currentPath = window.location.pathname.split('/').pop() || 'travel_recommendation.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'travel_recommendation.html')) {
        link.classList.add('active');
    }
});

// --- Results Page Specific Logic ---
async function fetchAndDisplayResults() {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword')?.toLowerCase().trim();
    const resultsContainer = document.getElementById('resultsGrid');
    const searchTermDisplay = document.getElementById('searchTerm');

    if (!keyword || !resultsContainer) return;
    if (searchTermDisplay) searchTermDisplay.textContent = `"${keyword}"`;

    try {
        const response = await fetch('travel_recommendation_api.json');
        const data = await response.json();
        let filteredResults = [];

        // Task 7: Handling keyword variations (beach, beaches, temple, temples, country, countries)
        if (keyword === 'beach' || keyword === 'beaches') {
            filteredResults = data.beaches;
        } else if (keyword === 'temple' || keyword === 'temples') {
            filteredResults = data.temples;
        } else if (keyword === 'country' || keyword === 'countries') {
            // If they just search "country", maybe show all cities from first country or all countries
            data.countries.forEach(country => filteredResults.push(...country.cities));
        } else {
            // Check for specific country names
            data.countries.forEach(country => {
                if (keyword === country.name.toLowerCase()) {
                    filteredResults.push(...country.cities);
                }
            });
        }

        displayResults(filteredResults);
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = '<p>Error loading recommendations.</p>';
    }
}

function displayResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultCount = document.getElementById('resultCount');
    if (!resultsGrid) return;

    if (resultCount) resultCount.textContent = `${results.length} horizon(s) found.`;

    if (results.length === 0) {
        resultsGrid.innerHTML = '<p class="no-results">No horizons found. Try "beach", "temple", or "Australia".</p>';
        return;
    }

    resultsGrid.innerHTML = results.map(item => {
        const imgSrc = item.imageUrl.startsWith('enter_your') 
            ? `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80` 
            : item.imageUrl;

        let timeString = '';
        if (item.name.includes('Australia')) {
            timeString = new Date().toLocaleTimeString('en-US', { timeZone: 'Australia/Sydney', hour: 'numeric', minute: 'numeric' });
        } else if (item.name.includes('Japan')) {
            timeString = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour: 'numeric', minute: 'numeric' });
        } else if (item.name.includes('Brazil')) {
            timeString = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', minute: 'numeric' });
        }

        return `
            <article class="card">
                <div class="card-img">
                    <img src="${imgSrc}" alt="${item.name}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="card-footer">
                        ${timeString ? `<span class="time-badge">${timeString} Local Time</span>` : '<span></span>'}
                        <button class="btn-primary" style="padding: 10px 20px; font-size: 0.8rem;">Explore</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

if (window.location.pathname.includes('results.html')) {
    fetchAndDisplayResults();
}
