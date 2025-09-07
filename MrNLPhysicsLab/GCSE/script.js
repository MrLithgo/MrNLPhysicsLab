// Load components with CSS handling
document.addEventListener('DOMContentLoaded', function() {
    // Load navbar
    fetch('../components/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Initialize mobile menu
            initMobileMenu();
            // Apply global styles to dynamically loaded content
            applyGlobalStyles();
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            document.getElementById('navbar-container').innerHTML = '<div class="nav-placeholder">Navigation will appear here</div>';
        });
    
    // Load footer
    fetch('../components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
            // Apply global styles to dynamically loaded content
            applyGlobalStyles();
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            document.getElementById('footer-container').innerHTML = '<div class="footer-placeholder">Footer will appear here</div>';
        });
});

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Apply global styles to dynamically loaded content
function applyGlobalStyles() {
    // This function ensures styles are applied to dynamically loaded content
    // Add any specific style adjustments needed for components here
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });
}

// Simulation alert function
function simulationAlert(simulation) {
    alert(`Opening ${simulation} simulation...`);
    // In a real implementation, this would navigate to the actual simulation page
}