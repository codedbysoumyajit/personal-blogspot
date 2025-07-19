// routes/index.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { marked } = require('marked');

// Configuration for pagination
const POSTS_PER_PAGE = 5;

// @route   GET /
// @desc    Show all blog posts on the homepage with pagination and search
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search ? req.query.search.trim() : '';
    res.locals.searchQuery = searchQuery;

    let query = {};
    if (searchQuery) {
        query.title = { $regex: searchQuery, $options: 'i' };
    }

    const skip = (page - 1) * POSTS_PER_PAGE;

    try {
        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

        const posts = await Post.find(query)
                                .sort({ createdAt: 'desc' })
                                .skip(skip)
                                .limit(POSTS_PER_PAGE);

        const postsWithParsedContent = posts.map(post => {
            let descriptionToParse = '';
            if (post.description) {
                descriptionToParse = post.description;
            } else {
                descriptionToParse = post.content.substring(0, 150) + '...';
            }
            const parsedDescription = marked.parse(descriptionToParse, { breaks: true, gfm: true });
            return {
                ...post.toObject(),
                parsedDescription: parsedDescription
            };
        });

        res.render('index', {
            posts: postsWithParsedContent,
            currentPage: page,
            totalPages: totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page - 1,
            nextPage: page + 1
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /posts/:id
// @desc    Show single blog post
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error_msg', 'Post not found.');
            return res.redirect('/');
        }

        const parsedContent = marked.parse(post.content, { breaks: true, gfm: true });

        res.render('posts/show', { post: post.toObject(), parsedContent });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error fetching post.');
        res.redirect('/');
    }
});

// @route   POST /api/posts/:id/like
// @desc    Increment/Decrement like count for a post
router.post('/api/posts/:id/like', async (req, res) => {
    const postId = req.params.id;
    const { action } = req.body;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        if (action === 'like') {
            post.likes += 1;
        } else if (action === 'unlike') {
            post.likes = Math.max(0, post.likes - 1);
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action specified.' });
        }

        await post.save();
        res.json({ success: true, newLikes: post.likes });

    } catch (err) {
        console.error('Error updating like count:', err);
        res.status(500).json({ success: false, message: 'Server error while updating likes.' });
    }
});

// @route   POST /api/posts/:id/view
// @desc    Increment view count for a post
router.post('/api/posts/:id/view', async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        post.views += 1;
        await post.save();
        res.json({ success: true, newViews: post.views });
    } catch (err) {
        console.error('Error updating view count:', err);
        res.status(500).json({ success: false, message: 'Server error while updating views.' });
    }
});

// @route   GET /about
// @desc    Show the About Me page
router.get('/about', (req, res) => {
    // You can pass dynamic data here if needed, but for a static page, it's optional.
    res.render('about');
});

module.exports = router;
