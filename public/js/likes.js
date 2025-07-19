// public/js/likes.js

document.addEventListener('DOMContentLoaded', () => {
    const likeButtons = document.querySelectorAll('.like-button');

    // Function to check if a post is liked (from localStorage)
    const isLiked = (postId) => {
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};
        return likedPosts[postId] === true;
    };

    // Function to update the button and count visually
    const updateLikeButtonUI = (button, postId, currentLikes) => {
        const icon = button.querySelector('.like-icon');
        const countSpan = button.querySelector('.like-count');

        countSpan.textContent = currentLikes;

        if (isLiked(postId)) {
            icon.classList.remove('bi-heart'); // Ensure correct icon if changed later
            icon.classList.add('bi-heart-fill'); // Filled heart if liked
            button.classList.add('liked'); // Add a class for custom liked styling if desired
        } else {
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart'); // Outline heart if not liked
            button.classList.remove('liked');
        }
    };

    // Initialize button states based on localStorage
    likeButtons.forEach(button => {
        const postId = button.dataset.postId;
        const initialLikes = parseInt(button.querySelector('.like-count').textContent);
        updateLikeButtonUI(button, postId, initialLikes);
    });

    // Event listener for all like buttons
    likeButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.dataset.postId;
            let currentLikes = parseInt(button.querySelector('.like-count').textContent);
            let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};
            let action = '';

            if (isLiked(postId)) {
                // Already liked, so unlike
                action = 'unlike';
                likedPosts[postId] = false;
                currentLikes = Math.max(0, currentLikes - 1); // Decrement
            } else {
                // Not liked, so like
                action = 'like';
                likedPosts[postId] = true;
                currentLikes += 1; // Increment
            }

            // Update localStorage
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

            // Optimistic UI update
            updateLikeButtonUI(button, postId, currentLikes);

            try {
                const response = await fetch(`/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action })
                });

                const data = await response.json();

                if (!data.success) {
                    // Revert UI if API call fails (pessimistic update for errors)
                    console.error('Failed to update like:', data.message);
                    alert('Could not update like. Please try again.');
                    // Revert localStorage and UI
                    if (action === 'like') {
                        likedPosts[postId] = false;
                        currentLikes -= 1;
                    } else {
                        likedPosts[postId] = true;
                        currentLikes += 1;
                    }
                    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                    updateLikeButtonUI(button, postId, currentLikes);
                } else {
                    // UI is already updated, just log success or do nothing
                    console.log(`Like updated for ${postId}: ${data.newLikes}`);
                    // Ensure the server's count matches, though optimistic update handles most cases
                    button.querySelector('.like-count').textContent = data.newLikes;
                }
            } catch (error) {
                console.error('Network error during like update:', error);
                alert('Network error. Could not update like.');
                // Revert UI and localStorage on network failure
                if (action === 'like') {
                    likedPosts[postId] = false;
                    currentLikes -= 1;
                } else {
                    likedPosts[postId] = true;
                    currentLikes += 1;
                }
                localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                updateLikeButtonUI(button, postId, currentLikes);
            }
        });
    });
});
