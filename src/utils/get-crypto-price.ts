import axios from 'axios';

type CryptoQuote = {
    quote: {
        USD: {
            price: string
        }
    }
};

export async function getCryptoPrice(crypto: string): Promise<string | undefined> {
    try {
        const { data: { data } } =  await axios.get(
            `${process.env.CMC_API_URL}/quotes/latest?symbol=${crypto}`, 
            { headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY } }
        );

        const cryptos: CryptoQuote[] = Object.values(data) as CryptoQuote[];
        
        return cryptos[0].quote?.USD?.price;

    } catch(err) {
        console.log('API call error:', err);
    }
}
