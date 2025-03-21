const API_URL = 'http://localhost:8000';

// DOM Elements
const articleModal = document.getElementById('articleModal');
const articleForm = document.getElementById('articleForm');
const modalTitle = document.getElementById('modalTitle');
const articlesList = document.getElementById('articlesList');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Show/Hide Modal
function toggleModal(show = true) {
    articleModal.classList.toggle('hidden', !show);
    if (!show) {
        articleForm.reset();
        articleForm.articleId.value = '';
        modalTitle.textContent = 'Create New Article';
    }
}

// Load Articles
async function loadArticles() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        const articles = await response.json();
        
        articlesList.innerHTML = articles.map(article => `
            <div class="border-b border-slate-200 pb-6">
                <div class="flex justify-between items-start gap-4">
                    <div class="flex gap-4">
                        <div class="w-24 h-24 flex-shrink-0">
                            <img src="${article.thumbnail || 'https://via.placeholder.com/150'}" 
                                 alt="${article.title}" 
                                 class="w-full h-full object-cover rounded-lg shadow-sm">
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900">${article.title}</h3>
                            <p class="text-slate-600 mt-1 line-clamp-2">${article.content.substring(0, 150)}...</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-sm text-slate-500">
                                    ${new Date(article.created_at).toLocaleDateString()}
                                </span>
                                <span class="inline-block h-1 w-1 rounded-full bg-slate-500"></span>
                                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                                    Tutorial
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editArticle(${article.id})" 
                                class="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors">
                            Edit
                        </button>
                        <button onclick="deleteArticle(${article.id})"
                                class="px-3 py-1 text-rose-600 hover:text-rose-800 transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

// Edit Article
async function editArticle(id) {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        const article = await response.json();
        
        articleForm.articleId.value = article.id;
        articleForm.title.value = article.title;
        articleForm.content.value = article.content;
        
        // Set up thumbnail preview if exists
        const preview = document.getElementById('thumbnailPreview');
        if (article.thumbnail) {
            preview.src = article.thumbnail;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
        
        modalTitle.textContent = 'Edit Article';
        toggleModal(true);
        
        // Update TinyMCE content
        tinymce.get('content').setContent(article.content);
    } catch (error) {
        console.error('Error loading article:', error);
    }
}

// Delete Article
async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
        await fetch(`${API_URL}/articles/${id}`, {
            method: 'DELETE'
        });
        loadArticles();
    } catch (error) {
        console.error('Error deleting article:', error);
    }
}

// Event Listeners
newPostBtn.addEventListener('click', () => toggleModal(true));
cancelBtn.addEventListener('click', () => toggleModal(false));

// Modified form submission to handle thumbnail
articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get the editor content and validate
    const editorContent = tinymce.get('content').getContent();
    if (!editorContent.trim()) {
        alert('Please enter some content for the article');
        return;
    }

    // Get title and validate
    const title = articleForm.title.value.trim();
    if (!title) {
        alert('Please enter a title for the article');
        return;
    }
    
    // Upload thumbnail if selected
    let thumbnailPath = null;
    const thumbnailFile = document.getElementById('thumbnail').files[0];
    if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        
        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                thumbnailPath = data.location;
            }
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
        }
    }
    
    const formData = {
        title: title,
        content: editorContent,
        thumbnail: thumbnailPath
    };
    
    const id = articleForm.articleId.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/articles/${id}` : `${API_URL}/articles`;
    
    try {
        showLoading(); // Show loading animation while saving
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save article');
        }
        
        hideLoading(); // Hide loading animation
        toggleModal(false);
        loadArticles();
    } catch (error) {
        hideLoading(); // Hide loading animation on error
        console.error('Error saving article:', error);
        alert('Failed to save article. Please try again.');
    }
});

// Initialize TinyMCE with more features
tinymce.init({
    selector: '#content',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | checklist numlist bullist | emoticons | removeformat',
    height: 500,
    skin: 'oxide',
    content_css: 'default',
    setup: function(editor) {
        editor.on('change', function() {
            // Update hidden input with content for validation
            const content = editor.getContent();
            document.getElementById('content-hidden').value = content;
        });
    },
    codesample_languages: [
        { text: 'Python', value: 'python' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'HTML/XML', value: 'markup' },
        { text: 'CSS', value: 'css' }
    ],
    content_style: `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            font-size: 16px;
            color: rgb(51, 65, 85);
        }
        pre {
            background-color: #1e1e1e !important;
            border-radius: 8px !important;
            padding: 1rem !important;
            margin: 1.5rem 0 !important;
        }
        code {
            font-family: 'Fira Code', monospace !important;
            color: #d4d4d4 !important;
        }
        .language-python { color: #569cd6 !important; }
        .language-python .comment { color: #6a9955 !important; }
        .language-python .string { color: #ce9178 !important; }
        .language-python .function { color: #dcdcaa !important; }
        .language-python .keyword { color: #c586c0 !important; }
        .language-python .operator { color: #d4d4d4 !important; }
    `,
    menubar: false,
    statusbar: false,
    branding: false,
    promotion: false
});

// Handle thumbnail preview
document.getElementById('thumbnail').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        const preview = document.getElementById('thumbnailPreview');
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            preview.classList.add('shadow-lg', 'transition-transform', 'hover:scale-105');
        };
        
        reader.readAsDataURL(file);
    }
});

// Initial load
loadArticles();

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