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
    city: { type: String, required: true, default: '' }, // Adicionado para salvar a cidade de atuação
    businessCardLink: { type: String, default: '' }, // Campo global do Corretor
}, {
    timestamps: true,
    collection: 'tenants' // 1. Garante explicitamente que apontará para a coleção 'tenants' do MongoDB Atlas
});

// 2. Passa 'tenants' como o terceiro parâmetro para blindar o mapeamento da coleção
export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');