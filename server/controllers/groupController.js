const Group = require('../models/Group');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listGroups = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };

    const groups = await Group.find(filter).sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    next(err);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name, description, type, privacy } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type are required' });

    const group = await Group.create({
      name,
      description,
      type,
      privacy,
      createdBy: req.user._id,
      members: [req.user._id],
      admins: [req.user._id],
    });

    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user._id.toString();
    if (group.members.some((id) => id.toString() === userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user._id);
    await group.save();

    group.admins.forEach((adminId) => {
      createNotification({
        recipient: adminId,
        actor: req.user._id,
        type: 'group_join',
        group: group._id,
      }).catch((err) => console.error('Failed to create group_join notification:', err.message));
    });

    res.json({ message: 'Joined group', group });
  } catch (err) {
    next(err);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user._id.toString();
    group.members = group.members.filter((id) => id.toString() !== userId);
    group.admins = group.admins.filter((id) => id.toString() !== userId);
    await group.save();
    res.json({ message: 'Left group' });
  } catch (err) {
    next(err);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name avatarUrl')
      .populate('admins', 'name avatarUrl');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ group });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/groups/register-courses  { department, courses: [String] }
// Finds-or-creates the matching department/course groups and joins the user to each.
const registerCoursesAndDepartment = async (req, res, next) => {
  try {
    const { department, courses = [] } = req.body;
    const joinedGroups = [];

    const findOrCreateGroup = async (rawName, type) => {
      const trimmed = (rawName || '').trim();
      if (!trimmed) return null;

      let group = await Group.findOne({
        type,
        name: { $regex: `^${escapeRegex(trimmed)}$`, $options: 'i' },
      });

      if (!group) {
        group = await Group.create({
          name: trimmed,
          type,
          description: `${type === 'department' ? 'Department' : 'Course'} group for ${trimmed}`,
          createdBy: req.user._id,
          members: [req.user._id],
          admins: [req.user._id],
        });
      } else if (!group.members.some((id) => id.toString() === req.user._id.toString())) {
        group.members.push(req.user._id);
        await group.save();
      }

      return group;
    };

    if (department) {
      const deptGroup = await findOrCreateGroup(department, 'department');
      if (deptGroup) joinedGroups.push(deptGroup);
      await User.findByIdAndUpdate(req.user._id, { department: department.trim() });
    }

    for (const courseName of courses) {
      const courseGroup = await findOrCreateGroup(courseName, 'course');
      if (courseGroup) joinedGroups.push(courseGroup);
    }

    res.status(200).json({ groups: joinedGroups });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  getGroup,
  registerCoursesAndDepartment,
};