const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const auth = require('../middleware/auth');

// GET all links for a specific collection (with optional search)
router.get('/:collectionId', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { collection: req.params.collectionId, user: req.userId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const links = await Link.find(query).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE a new link
router.post('/', auth, async (req, res) => {
  try {
    const { title, url, description, collection } = req.body;

    if (!title || !url || !collection) {
      return res.status(400).json({ message: 'Title, URL, and collection are required' });
    }

    const newLink = new Link({
      title,
      url,
      description,
      collection,
      user: req.userId
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE a link
router.put('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.userId });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    link.title = req.body.title || link.title;
    link.url = req.body.url || link.url;
    link.description = req.body.description !== undefined ? req.body.description : link.description;

    await link.save();
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE a link
router.delete('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.userId });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    await link.deleteOne();
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;