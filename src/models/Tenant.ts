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
    websiteLink: { type: String, default: '' },
    businessCardLink: { type: String, default: '' },

    // Limites de uso
    maxItems: { type: Number, default: 10 },
    maxImagesPerItem: { type: Number, default: 4 },

    // Data de vencimento da anuidade (Padrão: 1 ano a partir do cadastro)
    subscriptionExpiresAt: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            return date;
        }
    },
}, {
    timestamps: true,
    collection: 'tenants'
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');