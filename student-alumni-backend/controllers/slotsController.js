const Slot = require('../models/Slot');

// Create multiple slots
exports.createSlots = async (req, res) => {
  try {
    const { slots } = req.body; // expect array of { date, startTime, endTime }
    if (!Array.isArray(slots) || slots.length === 0) return res.status(400).json({ message: 'No slots provided' });

    if (!req.user || !req.user._id) {
      console.error('Unauthorized: req.user missing when creating slots');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user._id;
    console.debug('Incoming slots payload:', Array.isArray(slots) ? slots.length : typeof slots, slots);
    const docsToInsert = [];
    const skipped = [];
    const now = new Date();

    for (const s of slots) {
      // support two shapes: { date, startTime, endTime } OR { start, end } (ISO strings)
      let start = null;
      let end = null;
      if (s.start && s.end) {
        // allow clients to send ISO strings for start/end
        start = new Date(s.start);
        end = new Date(s.end);
      } else {
        const { date, startTime, endTime } = s || {};
        if (!date || !startTime || !endTime) {
          skipped.push({ slot: s, reason: 'missing fields' });
          continue;
        }

        // build Date objects from date + time
        start = new Date(`${date}T${startTime}:00`);
        end = new Date(`${date}T${endTime}:00`);
      }

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        skipped.push({ slot: s, reason: 'invalid date/time' });
        continue;
      }
      // validate end after start
      if (end <= start) {
        skipped.push({ slot: s, reason: 'end must be after start' });
        continue;
      }
      // no past slots
      if (end <= now) {
        skipped.push({ slot: s, reason: 'slot is in the past' });
        continue;
      }

      docsToInsert.push({ userId, start, end });
    }

    console.debug(`Prepared ${docsToInsert.length} valid slot docs for user ${userId}`);
    if (docsToInsert.length === 0) {
      return res.status(400).json({ message: 'No valid slots to create', skipped });
    }

    console.debug(`Creating ${docsToInsert.length} slot(s) for user ${userId}`);
    // insertMany to create all valid slots in one operation
    // ordered:false allows others to be inserted if one fails
    let created;
    try {
      created = await Slot.insertMany(docsToInsert, { ordered: false });
    } catch (bulkErr) {
      // log and capture bulk write errors but still try to return what was created
      console.error('Bulk insert error:', bulkErr && bulkErr.message);

      // handle duplicate-key caused by a legacy/incorrect index by attempting to drop it and retry once
      const isDupKey = bulkErr && (bulkErr.code === 11000 || (bulkErr.message && bulkErr.message.includes('duplicate key')) || (bulkErr.name === 'BulkWriteError'));
      if (isDupKey) {
        try {
          const coll = Slot.collection;
          // inspect indexes to find problematic names containing 'alumniId' or 'slots'
          const idxs = await coll.indexes();
          const legacy = idxs.find(i => i.name && i.name.toLowerCase().includes('alumniid') );
          if (legacy) {
            console.warn(`Dropping legacy index ${legacy.name} on slots collection due to duplicate-key error`);
            await coll.dropIndex(legacy.name);
            console.warn(`Dropped legacy index ${legacy.name}, retrying insert`);
            // retry insert once
            created = await Slot.insertMany(docsToInsert, { ordered: false });
          }
        } catch (dropErr) {
          console.error('Error dropping legacy index or retrying insert:', dropErr && dropErr.message);
        }
      }

      // if older driver provides insertedDocs, capture it
      if (!created && bulkErr && bulkErr.insertedDocs) {
        created = bulkErr.insertedDocs;
      }
      // if still not created, rethrow to outer catch
      if (!created) throw bulkErr;
    }

    res.json({ createdCount: (created && created.length) || 0, created: created || [], skipped });
  } catch (err) {
    console.error('Error creating slots:', err && err.message);
    // in dev, include stack for faster debugging — remove in production
    res.status(500).json({ message: 'Server error creating slots', error: err && err.message, stack: err && err.stack });
  }
};

// Get my slots
exports.getMySlots = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    // only future slots
    const slots = await Slot.find({ userId, end: { $gt: now } }).sort({ start: 1 });
    res.json({ slots });
  } catch (err) {
    console.error('Error fetching my slots:', err);
    res.status(500).json({ message: 'Server error fetching slots' });
  }
};

// Get slots for a specified user (student viewing alumni availability)
exports.getSlotsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const now = new Date();
    // only future slots
    const slots = await Slot.find({ userId, end: { $gt: now } }).sort({ start: 1 });
    res.json({ slots });
  } catch (err) {
    console.error('Error fetching slots for user:', err);
    res.status(500).json({ message: 'Server error fetching slots' });
  }
};

// optional: delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const userId = req.user._id;
    const slot = await Slot.findOneAndDelete({ _id: slotId, userId });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting slot:', err);
    res.status(500).json({ message: 'Server error deleting slot' });
  }
};

// delete all slots for the logged-in user
exports.clearSlots = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Slot.deleteMany({ userId });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error clearing slots:', err && err.message);
    res.status(500).json({ message: 'Server error clearing slots' });
  }
};
