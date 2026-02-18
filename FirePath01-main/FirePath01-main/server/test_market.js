
const fetch = global.fetch || require('node-fetch');

async function test() {
    try {
        const symbols = ['^NSEI', '^NSEBANK', '^BSESN'];
        console.log('Fetching symbols:', symbols);

        const symbol = 'NIFTY_50:INDEXNSE'; // Google Finance format
        console.log('Fetching Google Finance for:', symbol);

        const response = await fetch(`https://www.google.com/finance/quote/${symbol}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const text = await response.text();
        console.log('Response length:', text.length);
        const match = text.match(/<div class="YMlKec fxKbKc">([^<]+)<\/div>/);
        if (match) {
            console.log('Price found:', match[1]);
        }

        // Find Previous close
        const prevCloseIdx = text.indexOf('Previous close');
        if (prevCloseIdx !== -1) {
            console.log('Previous close found at:', prevCloseIdx);
            console.log('Surrounding HTML:', text.substring(prevCloseIdx, prevCloseIdx + 200));
        } else {
            console.log('Previous close NOT found');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
