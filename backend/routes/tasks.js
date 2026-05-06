const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/tasks?project=xxx — get tasks for a project
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.query.project) {
      filter.project = req.query.project;
    }

    // Members can only see tasks in projects they belong to
    if (req.user.role !== 'admin') {
      // Find projects this user is in
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      filter.project = { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/my — tasks assigned to me
router.get('/my', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 }); // Sort by due date

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks — create task (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, project, assignedTo, dueDate, priority } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      priority,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/tasks/:id — update task
// Admin can update anything, member can only update status of their own tasks
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'member') {
      // Members can only update their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      // Members can only change the status, nothing else
      const { status } = req.body;
      task.status = status || task.status;
    } else {
      // Admin can change everything
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
    }

    const updated = await task.save();
    await updated.populate('assignedTo', 'name email');
    await updated.populate('project', 'name');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/stats/dashboard — dashboard numbers
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const now = new Date();
    let filter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      filter.project = { $in: userProjects.map(p => p._id) };
    }

    const [total, completed, inProgress, overdue, assignedToMe] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'done' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: { $ne: 'done' }, dueDate: { $lt: now } }),
      Task.countDocuments({ assignedTo: req.user._id })
    ]);

    res.json({ total, completed, inProgress, overdue, assignedToMe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
