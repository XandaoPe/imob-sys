import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Alterado para um Array de Strings Base64
}, { timestamps: true });

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);