// public/js/post-actions.js

document.addEventListener('DOMContentLoaded', () => {
    const postId = document.querySelector('.card.post-detail-card')?.dataset.postId || // Try to get from post-detail-card ID
                   document.querySelector('.card.post-detail-card .like-button')?.dataset.postId; // Fallback to like button's ID

    const viewCountDisplay = document.getElementById('view-count-display');

    if (postId && viewCountDisplay) {
        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts')) || {};

        if (!viewedPosts[postId]) {
            // Mark post as viewed in localStorage
            viewedPosts[postId] = true;
            localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));

            // Send request to increment view count on the server
            fetch(`/api/posts/${postId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Empty body for a simple increment
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    viewCountDisplay.textContent = data.newViews; // Update UI with new count
                    console.log(`View count updated for post ${postId}: ${data.newViews}`);
                } else {
                    console.error('Failed to update view count:', data.message);
                }
            })
            .catch(error => {
                console.error('Network error updating view count:', error);
            });
        }
    }

    // --- Share Button Logic (will be added here in Part 2) ---
    const shareButtonsContainer = document.getElementById('share-buttons-container');
    if (shareButtonsContainer) {
        const postTitle = document.querySelector('.card-title')?.textContent.trim() || 'My Blog Post';
        const postUrl = window.location.href;

        // Function to open share window
        const openShareWindow = (url) => {
            window.open(url, '_blank', 'width=600,height=400,resizable=yes,scrollbars=yes');
        };

        shareButtonsContainer.addEventListener('click', (event) => {
            const target = event.target.closest('button'); // Get the clicked button
            if (!target) return;

            const platform = target.dataset.platform;

            switch (platform) {
                case 'facebook':
                    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(postTitle)}`);
                    break;
                case 'twitter':
                    openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`);
                    break;
                case 'linkedin':
                    openShareWindow(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`);
                    break;
                case 'copy':
                    navigator.clipboard.writeText(postUrl)
                        .then(() => alert('Link copied to clipboard!'))
                        .catch(err => console.error('Failed to copy text: ', err));
                    break;
                case 'whatsapp':
                    // Note: WhatsApp share requires mobile device for direct open, otherwise web.whatsapp.com
                    window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(postTitle + " " + postUrl)}`;
                    break;
                case 'email':
                    window.location.href = `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(postTitle + '\n\n' + postUrl)}`;
                    break;
            }
        });
    }
});
