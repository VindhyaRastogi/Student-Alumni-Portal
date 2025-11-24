const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  ciphertext: { type: String },
  iv: { type: String },
  encrypted: { type: Boolean, default: false },
  ts: { type: Date, default: Date.now }
}, { _id: false });

const ChatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  pubkeys: { type: Map, of: Schema.Types.Mixed, default: {} },
  messages: [MessageSchema]
}, { timestamps: true });

// ensure a pair of participants can be queried regardless of order via a compound index
ChatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
