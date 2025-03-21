// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
});

// Add smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add dynamic date to blog posts
document.addEventListener('DOMContentLoaded', function() {
    const dates = document.querySelectorAll('.text-gray-500');
    dates.forEach(date => {
        date.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    });
});

const API_URL = 'http://localhost:8000';

async function loadArticles() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        const articles = await response.json();
        
        const articlesGrid = document.querySelector('#articlesList');
        if (!articlesGrid) return;
        
        // Sort articles by date and take the latest 4
        const latestArticles = articles
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 4);
        
        articlesGrid.innerHTML = latestArticles.map(article => `
            <article class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div class="md:flex">
                    <div class="md:w-1/3">
                        <img src="${article.thumbnail || 'https://via.placeholder.com/800x600'}" 
                             alt="${article.title}" 
                             class="w-full h-48 md:h-full object-cover">
                    </div>
                    <div class="p-8 md:w-2/3">
                        <div class="text-sm text-gray-500 mb-3">
                            ${new Date(article.created_at).toLocaleDateString()}
                        </div>
                        <h2 class="text-2xl font-semibold text-gray-900 mb-4">${article.title}</h2>
                        <div class="text-gray-600 mb-6 leading-relaxed">
                            ${article.content.substring(0, 200)}...
                        </div>
                        <a href="article.html?id=${article.id}" 
                           class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Read More
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

// Load articles when the page loads
document.addEventListener('DOMContentLoaded', loadArticles);

// Loading animation controls
function showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    overlay.classList.remove('active');
}

// Simulate loading time for smoother transitions
async function simulateLoading() {
    showLoading();
    await new Promise(resolve => setTimeout(resolve, 2000));
    hideLoading();
}

// Add loading to all navigation links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        link.addEventListener('click', async (e) => {
            // Only handle internal links
            if (link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                await simulateLoading();
                window.location.href = link.href;
            }
        });
    });

    // Hide loading on initial page load
    hideLoading();
}); 