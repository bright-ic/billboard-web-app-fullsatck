import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
    reason: string;
    subject: string;
    description: string;
    user: mongoose.Schema.Types.ObjectId;
    status: 'open' | 'closed';
    attachments: string[];
  }
  
  const TicketSchema: Schema = new Schema({
    reason: { type: String, required: false },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    attachments: [{ type: String }],
  }, { timestamps: true, collection: "ticket" });
  
  const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', TicketSchema);

  export default Ticket;