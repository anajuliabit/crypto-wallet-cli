import axios from 'axios';

type PriceResponse = {
    [index: string]: { usd: string }
}

export async function getCryptoPrice(currencies: string[]): Promise<PriceResponse | undefined> {
    try {
        const { data } = await axios.get(`${process.env.API_URL}/simple/price?ids=${currencies.join(',')}&vs_currencies=usd`);
        
        return data as PriceResponse;

    } catch(err) {
        console.log('API call error:', err);
    }
}
