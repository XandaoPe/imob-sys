import mongoose from 'mongoose';

// Garante o reset do cache do model no Next.js em ambiente de desenvolvimento
if (mongoose.models.Tenant) {
    delete mongoose.models.Tenant;
}

const TenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    businessCardLink: { type: String, default: '' }, // Novo campo global do Corretor
}, { timestamps: true });

export default mongoose.model('Tenant', TenantSchema);