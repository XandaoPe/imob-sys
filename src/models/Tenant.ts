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

    // Controle de Pagamento da Anuidade
    isAnuidadePaid: { type: Boolean, default: false },

    // Data de vencimento (Inicia com 7 dias de teste gratuito)
    subscriptionExpiresAt: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date;
        }
    },
}, {
    timestamps: true,
    collection: 'tenants'
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');