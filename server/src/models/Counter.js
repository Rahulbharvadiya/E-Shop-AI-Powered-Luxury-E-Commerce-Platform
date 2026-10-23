import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const Counter = mongoose.model('Counter', counterSchema);

export async function getNextSequence(name) {
  const result = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

export async function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = await getNextSequence(`order_${dateStr}`);
  return `ORD-${dateStr}-${String(seq).padStart(5, '0')}`;
}

export async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`invoice_${year}`);
  return `ESH-${year}-${String(seq).padStart(6, '0')}`;
}
