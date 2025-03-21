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
        
        articlesGrid.innerHTML = articles.map(article => `
            <article class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                <div class="h-48 overflow-hidden">
                    <img src="${article.thumbnail || 'https://via.placeholder.com/800x600'}" 
                         alt="${article.title}" 
                         class="w-full h-full object-cover">
                </div>
                <div class="p-6">
                    <div class="text-sm text-gray-500 mb-2">
                        ${new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">${article.title}</h2>
                    <div class="text-gray-600 mb-4 prose">
                        ${article.content.substring(0, 150)}...
                    </div>
                    <a href="article.html?id=${article.id}" class="text-blue-600 hover:text-blue-800">Read More →</a>
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