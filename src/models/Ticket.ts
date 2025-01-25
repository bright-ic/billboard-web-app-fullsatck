import mongoose, { Schema, Document, Model } from 'mongoose';

interface ITicket extends Document {
    subject: string;
    description: string;
    user: mongoose.Schema.Types.ObjectId;
    status: 'open' | 'closed';
    attachments: string[];
  }
  
  const TicketSchema: Schema = new Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    attachments: [{ type: String }],
  }, { timestamps: true, collection: "ticket" });
  
  const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', TicketSchema);

  export default Ticket;