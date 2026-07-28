import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    businessCardLink: { type: String, default: '' },
    expiresAt: { type: Date, required: true }, // Data limite de validade do anúncio
    isActive: { type: Boolean, default: true }, // Controle de ativo/inativo
}, { timestamps: true });

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);