// Create loading spinner with animated dots
const createLoadingSpinner = () => {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'loading-dots';
    
    // Add three dots
    for (let i = 1; i <= 3; i++) {
        const dot = document.createElement('div');
        dot.className = `dot dot-${i}`;
        dotsContainer.appendChild(dot);
    }
    
    // Add loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Loading...';
    
    spinner.appendChild(dotsContainer);
    spinner.appendChild(loadingText);
    return spinner;
};

// Initialize loading animation
const initLoading = () => {
    // Add loading spinner to document
    const spinner = createLoadingSpinner();
    document.body.appendChild(spinner);

    // Add loading class to main content
    const mainContent = document.querySelector('main') || document.querySelector('.page-transition');
    if (mainContent) {
        mainContent.classList.add('loading');
    }

    // Show content when everything is loaded with delay
    window.addEventListener('load', () => {
        // Keep loading screen visible for 1.5 seconds for better UX
        setTimeout(() => {
            spinner.style.opacity = '0';
            if (mainContent) {
                mainContent.classList.add('loaded');
            }
            // Remove spinner after fade out
            setTimeout(() => {
                spinner.style.display = 'none';
            }, 500);
        }, 1500);
    });

    return spinner;
};

// Initialize loading animation
const spinner = initLoading();

// Export spinner for use in other scripts
window.loadingSpinner = spinner; 