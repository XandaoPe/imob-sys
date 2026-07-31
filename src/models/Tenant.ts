import mongoose from 'mongoose';

if (mongoose.models.Tenant) {
    delete mongoose.models.Tenant;
}

// Helper para obter a data atual no fuso de Brasília sem adicionar dias extras
function getBrasiliaCurrentDate(): Date {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);

    return new Date(Date.UTC(year, month, day, 3, 0, 0));
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

    // Data de vencimento inicial igual à data de criação
    subscriptionExpiresAt: {
        type: Date,
        default: getBrasiliaCurrentDate
    },
}, {
    timestamps: true,
    collection: 'tenants'
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');