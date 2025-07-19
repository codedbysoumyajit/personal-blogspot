// public/js/theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement; // Get the <html> element

    // Function to set the theme
    const setTheme = (theme) => {
        htmlElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);

        // Update button icon and classes
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="bi bi-moon-fill"></i>'; // Moon icon for dark mode
            themeToggleBtn.classList.remove('btn-light', 'text-dark');
            themeToggleBtn.classList.add('btn-dark', 'text-light'); // Dark button, light text
        } else {
            themeToggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>'; // Sun icon for light mode
            themeToggleBtn.classList.remove('btn-dark', 'text-light');
            themeToggleBtn.classList.add('btn-light', 'text-dark'); // Light button, dark text
        }
    };

    // Get preferred theme from localStorage or default based on system
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else if (systemPrefersDark) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    // Event listener for the theme toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }
});
