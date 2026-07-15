import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';

export async function GET() {
    try {
        // 1. Garante a conexão ativa com o MongoDB
        await connectDB();

        // 2. Busca valores únicos do campo 'city'
        // Filtrando para garantir que não tragamos valores nulos, indefinidos ou vazios
        const cities = await Tenant.distinct('city', {
            city: { $exists: true, $ne: '', $not: { $type: 10 } } // $type 10 evita valores nulos (null) do BSON
        });

        // 3. Validação de segurança: se por algum motivo cities não for um array, inicializa vazio
        const safeCities: string[] = Array.isArray(cities) ? cities : [];

        // 4. Ordena as cidades em ordem alfabética de forma segura contra falhas de tipagem
        const sortedCities = safeCities
            .map(city => String(city).trim())
            .filter(city => city.length > 0)
            .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

        return NextResponse.json(sortedCities);
    } catch (error: any) {
        console.error('Erro ao buscar cidades únicas:', error);
        return NextResponse.json({ error: 'Erro ao listar cidades' }, { status: 500 });
    }
}