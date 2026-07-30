export function generatePixPayload(pixKey: string, amount: number, merchantName: string, merchantCity: string, txid: string = '***') {
    const formatField = (id: string, value: string) => {
        const len = String(value.length).padStart(2, '0');
        return `${id}${len}${value}`;
    };

    const normalizeText = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .toUpperCase()
            .trim();
    };

    // Formatação correta da chave Pix (Suporte a E.164 para telefones e e-mails/aleatória)
    let formattedKey = pixKey.trim();
    const digits = formattedKey.replace(/\D/g, '');

    // Se for um número de telefone sem o DDI, adiciona o +55 obrigatório do padrão Pix
    if (!formattedKey.startsWith('+') && (digits.length === 10 || digits.length === 11)) {
        formattedKey = `+55${digits}`;
    } else if (!formattedKey.startsWith('+') && digits.length === 13 && digits.startsWith('55')) {
        formattedKey = `+${digits}`;
    }

    const formattedAmount = amount.toFixed(2);
    const cleanMerchantName = normalizeText(merchantName).substring(0, 25) || 'MOTA CARVALHO IMOVEIS';
    const cleanMerchantCity = normalizeText(merchantCity).substring(0, 15) || 'SAO PAULO';

    const cleanTxid = (txid && txid !== '***')
        ? txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25)
        : 'MOTACARVALHO';

    // 1. Merchant Account Information (Tag 26)
    const gui = formatField('00', 'BR.GOV.BCB.PIX');
    const keyField = formatField('01', formattedKey);
    const merchantAccountInfo = formatField('26', gui + keyField);

    // 2. Additional Data Field (Tag 62) - Contém o TXID (Tag 05)
    const txidField = formatField('05', cleanTxid);
    const additionalDataField = formatField('62', txidField);

    // 3. Montagem do payload EMV padrão Pix
    const payloadWithoutCRC =
        formatField('00', '01') +           // Payload Format Indicator
        merchantAccountInfo +               // Tag 26 (Chave Pix e GUI)
        formatField('52', '0000') +         // Merchant Category Code
        formatField('53', '986') +          // Currency (BRL = 986)
        formatField('54', formattedAmount) +// Transaction Amount
        formatField('58', 'BR') +           // Country Code
        formatField('59', cleanMerchantName) +// Merchant Name
        formatField('60', cleanMerchantCity) +// Merchant City
        additionalDataField +               // Tag 62 (TXID)
        '6304';                             // CRC16 placeholder

    // 4. Cálculo correto do CRC16 (CCITT-FALSE)
    const calculateCRC16 = (str: string) => {
        let crc = 0xFFFF;
        for (let c = 0; c < str.length; c++) {
            crc ^= str.charCodeAt(c) << 8;
            for (let i = 0; i < 8; i++) {
                if ((crc & 0x8000) !== 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
                crc &= 0xFFFF;
            }
        }
        return crc.toString(16).toUpperCase().padStart(4, '0');
    };

    return payloadWithoutCRC + calculateCRC16(payloadWithoutCRC);
}