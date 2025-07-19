// routes/admin.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// Middleware to protect admin routes
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/auth/login');
}

// @route   GET /admin/dashboard
// @desc    Admin Dashboard - show all posts for management
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ createdAt: 'desc' });
        res.render('admin/dashboard', { posts });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error fetching posts for dashboard.');
        res.redirect('/');
    }
});

// @route   GET /admin/posts/new
// @desc    Show form to create new post
router.get('/posts/new', ensureAuthenticated, (req, res) => {
    res.render('admin/add-post');
});

// @route   POST /admin/posts
// @desc    Handle create new post with optional image upload
router.post('/posts', ensureAuthenticated, (req, res) => {
    req.upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            if (err instanceof multer.MulterError) {
                req.flash('error_msg', `File upload error: ${err.message}`);
            } else {
                req.flash('error_msg', `Image upload failed: ${err}`);
            }
            return res.redirect('/admin/posts/new');
        }

        // --- NEW: Destructure author and location ---
        const { title, description, content, author, location } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Validate required fields
        if (!title || !description || !content) {
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting incomplete upload:', unlinkErr);
                });
            }
            req.flash('error_msg', 'Please fill in all required fields (title, description, content).');
            return res.redirect('/admin/posts/new');
        }

        try {
            // --- NEW: Save author and location ---
            const newPost = new Post({
                title,
                description,
                content,
                imageUrl,
                author: author || 'Admin', // Use provided author, or default to 'Admin'
                location: location || null // Use provided location, or default to null
            });
            await newPost.save();
            req.flash('success_msg', 'Post created successfully!');
            res.redirect('/admin/dashboard');
        } catch (dbErr) {
            console.error(dbErr);
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting failed DB upload:', unlinkErr);
                });
            }
            req.flash('error_msg', 'Error creating post.');
            res.redirect('/admin/posts/new');
        }
    });
});

// @route   GET /admin/posts/:id/edit
// @desc    Show form to edit post
router.get('/posts/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error_msg', 'Post not found.');
            return res.redirect('/admin/dashboard');
        }
        res.render('admin/edit-post', { post });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error fetching post for edit.');
        res.redirect('/admin/dashboard');
    }
});

// @route   PUT /admin/posts/:id
// @desc    Handle update post with optional image upload
router.put('/posts/:id', ensureAuthenticated, (req, res) => {
    req.upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            if (err instanceof multer.MulterError) {
                req.flash('error_msg', `File upload error: ${err.message}`);
            } else {
                req.flash('error_msg', `Image upload failed: ${err}`);
            }
            return res.redirect(`/admin/posts/${req.params.id}/edit`);
        }

        // --- NEW: Destructure author and location ---
        const { title, description, content, author, location } = req.body;
        let imageUrl = req.body.existingImageUrl || null;

        // Image upload/removal logic
        if (req.file) {
            try {
                const oldPost = await Post.findById(req.params.id);
                if (oldPost && oldPost.imageUrl) {
                    const oldImagePath = path.join(__dirname, '../public', oldPost.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting old image:', unlinkErr);
                        });
                    }
                }
            } catch (findErr) {
                console.error('Error finding old post for image deletion:', findErr);
            }
            imageUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            try {
                const oldPost = await Post.findById(req.params.id);
                if (oldPost && oldPost.imageUrl) {
                    const oldImagePath = path.join(__dirname, '../public', oldPost.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting image on removal request:', unlinkErr);
                        });
                    }
                }
            } catch (findErr) {
                console.error('Error finding post for image removal:', findErr);
            }
            imageUrl = null;
        }

        // Validate required fields
        if (!title || !description || !content) {
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting incomplete upload on update:', unlinkErr);
                });
            }
            req.flash('error_msg', 'Please fill in all required fields (title, description, content).');
            return res.redirect(`/admin/posts/${req.params.id}/edit`);
        }

        try {
            // --- NEW: Update author and location ---
            await Post.findByIdAndUpdate(req.params.id,
                {
                    title,
                    description,
                    content,
                    imageUrl,
                    author: author || 'Admin', // Use provided author, or default to 'Admin'
                    location: location || null // Use provided location, or default to null
                },
                { new: true, runValidators: true });
            req.flash('success_msg', 'Post updated successfully!');
            res.redirect('/admin/dashboard');
        } catch (dbErr) {
            console.error(dbErr);
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting new upload after DB update failure:', unlinkErr);
                });
            }
            req.flash('error_msg', 'Error updating post.');
            res.redirect(`/admin/posts/${req.params.id}/edit`);
        }
    });
});

// @route   DELETE /admin/posts/:id
// @desc    Handle delete post (and its image)
router.delete('/posts/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post && post.imageUrl) {
            const imagePath = path.join(__dirname, '../public', post.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting image file:', err);
                });
            }
        }
        await Post.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Post deleted successfully!');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting post.');
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;
