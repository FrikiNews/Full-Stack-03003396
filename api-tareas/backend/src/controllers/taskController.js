const Task = require('../models/Task');
const { syncTasksForUser } = require('../services/taskFileStorage');

async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ user: req.session.userId })
      .sort({ dateTime: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.session.userId
    });

    await syncTasksForUser(req.session.userId);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    await syncTasksForUser(req.session.userId);

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    await syncTasksForUser(req.session.userId);

    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
}

async function syncToFile(req, res, next) {
  try {
    await syncTasksForUser(req.session.userId);
    res.json({ message: 'Tareas sincronizadas en archivo JSON.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  syncToFile
};
