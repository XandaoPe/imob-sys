import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // Corrigido para passwordHash
}, { timestamps: true });

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);