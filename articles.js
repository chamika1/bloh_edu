const API_URL = 'http://localhost:8000';

async function loadArticles() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        const articles = await response.json();
        
        const articlesList = document.getElementById('articlesList');
        articlesList.innerHTML = articles.map(article => `
            <article class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="md:flex">
                    <div class="md:w-1/3">
                        <img src="${article.thumbnail || 'https://via.placeholder.com/800x600'}" 
                             alt="${article.title}" 
                             class="w-full h-48 md:h-full object-cover">
                    </div>
                    <div class="p-6 md:w-2/3">
                        <div class="text-sm text-gray-500 mb-2">
                            ${new Date(article.created_at).toLocaleDateString()}
                        </div>
                        <h2 class="text-2xl font-semibold text-gray-900 mb-4">${article.title}</h2>
                        <div class="text-gray-600 mb-4">
                            ${article.content.substring(0, 200)}...
                        </div>
                        <a href="article.html?id=${article.id}" 
                           class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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