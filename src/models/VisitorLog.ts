import mongoose from 'mongoose';

const VisitorEventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'view_item',
            'view_image',
            'click_whatsapp',
            'click_website',
            'click_business_card',
            'share',
            'scroll_deep',
            'leave_page'
        ]
    },
    itemId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const VisitorLogSchema = new mongoose.Schema({
    // Identificação
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sessionId: { type: String, required: true, index: true },

    // Dados do visitante
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    device: { type: String, default: '' },
    language: { type: String, default: '' },
    screenResolution: { type: String, default: '' },
    referrer: { type: String, default: '' },

    // Geolocalização
    country: { type: String, default: '' },
    region: { type: String, default: '' },
    city: { type: String, default: '' },
    isp: { type: String, default: '' },

    // Comportamento
    enteredAt: { type: Date, default: Date.now, index: true },
    lastActivityAt: { type: Date, default: Date.now },
    durationSeconds: { type: Number, default: 0 },
    scrollDepthPercent: { type: Number, default: 0 },

    // Eventos
    events: [VisitorEventSchema]
}, {
    timestamps: true,
    collection: 'visitor_logs'
});

// Índice TTL: apaga automaticamente após 1 ano (365 dias)
VisitorLogSchema.index({ enteredAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Índices para consultas rápidas
VisitorLogSchema.index({ tenantId: 1, enteredAt: -1 });
VisitorLogSchema.index({ ip: 1, tenantId: 1 });

export default mongoose.models.VisitorLog || mongoose.model('VisitorLog', VisitorLogSchema);