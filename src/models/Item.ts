import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    title: string;
    description: string;
    imageBase64?: string;
    tenantId: mongoose.Types.ObjectId;
}

const ItemSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageBase64: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
}, { timestamps: true });

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);