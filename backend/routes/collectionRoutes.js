const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Link = require('../models/Link');
const auth = require('../middleware/auth');

// GET all collections for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE a new collection
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const newCollection = new Collection({
      name,
      description,
      user: req.userId
    });

    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE a collection
router.put('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.userId });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.name = req.body.name || collection.name;
    collection.description = req.body.description || collection.description;

    await collection.save();
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE a collection (and its links)
router.delete('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.userId });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await Link.deleteMany({ collection: collection._id });
    await collection.deleteOne();

    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;