const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/projects — get all projects user is part of
router.get('/', protect, async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      // Admins see everything
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    } else {
      // Members only see projects they're added to
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/projects/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/projects — create project (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, description, members } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: members || []
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/projects/:id — update project (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/projects/:id (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
