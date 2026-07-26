import { useState, useEffect } from 'react';
// cspell:disable-next-line
import estadosCidades from 'estados-cidades';

export function useCities() {
    const [allCities, setAllCities] = useState<string[]>([]);

    useEffect(() => {
        try {
            const ufs = estadosCidades.states();
            const listaFormatada: string[] = [];

            ufs.forEach((uf: string) => {
                const cidadesDoEstado = estadosCidades.cities(uf);
                cidadesDoEstado.forEach((nomeCidade: string) => {
                    listaFormatada.push(`${nomeCidade} (${uf})`);
                });
            });

            listaFormatada.sort((a, b) => a.localeCompare(b));
            setAllCities(listaFormatada);
        } catch (err) {
            console.error('Erro ao carregar a lista de cidades:', err);
        }
    }, []);

    return allCities;
}