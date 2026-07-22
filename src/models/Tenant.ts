import mongoose from 'mongoose';

if (mongoose.models.Tenant) {
    delete mongoose.models.Tenant;
}

const TenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    city: { type: String, required: true, default: '' },
    websiteLink: { type: String, default: '' }, // <-- NOVO CAMPO
    businessCardLink: { type: String, default: '' },
}, {
    timestamps: true,
    collection: 'tenants'
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');