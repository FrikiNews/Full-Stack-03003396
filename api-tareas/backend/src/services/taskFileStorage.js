const fs = require('fs/promises');
const path = require('path');
const Task = require('../models/Task');

const dataDir = path.resolve(__dirname, '..', 'data');

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function syncTasksForUser(userId) {
  await ensureDataDir();

  const tasks = await Task.find({ user: userId }).sort({ dateTime: 1, createdAt: -1 }).lean();
  const filePath = path.join(dataDir, `tasks-${userId}.json`);

  await fs.writeFile(filePath, JSON.stringify(tasks, null, 2), 'utf-8');
}

module.exports = { syncTasksForUser };
