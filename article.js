const API_URL = 'http://localhost:8000';

async function loadArticle() {
    try {
        // Get article ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            console.error('No article ID provided');
            window.location.href = 'articles.html';
            return;
        }

        // Show loading spinner
        showLoading();
        
        console.log('Fetching article with ID:', articleId);
        const response = await fetch(`${API_URL}/articles/${articleId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch article. Status: ${response.status}`);
        }

        const article = await response.json();
        console.log('Article data received:', article);

        // Update the page with article content
        document.title = `${article.title} - TechStudy Hub`;
        document.getElementById('articleImage').src = article.thumbnail || 'https://via.placeholder.com/1200x600';
        document.getElementById('articleDate').textContent = new Date(article.created_at).toLocaleDateString();
        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleContent').innerHTML = article.content;

        // Hide loading spinner
        hideLoading();

        // Initialize syntax highlighting if needed
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    } catch (error) {
        console.error('Error loading article:', error);
        hideLoading();
        alert('Failed to load the article. Redirecting to articles page...');
        window.location.href = 'articles.html';
    }
}

// Loading animation controls
function showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    overlay.classList.remove('active');
}

// Load article when the page loads
document.addEventListener('DOMContentLoaded', loadArticle);

// Add loading to all navigation links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        link.addEventListener('click', async (e) => {
            // Only handle internal links
            if (link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                showLoading();
                await new Promise(resolve => setTimeout(resolve, 500));
                window.location.href = link.href;
            }
        });
    });
}); 