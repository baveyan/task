const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port =  3000;

async function fetchSearchResults(query) {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching search results:', error);
        return null;
    }
}

async function findBestSeller(html) {
    const $ = cheerio.load(html);
    const bestSellerSelector = 'div[data-component-type="s-search-result"] .a-badge-label';
    let bestSellerUrl = '';

    $(bestSellerSelector).each((i, elem) => {
        if ($(elem).text().includes('Best Seller')) {
            const parent = $(elem).closest('[data-component-type="s-search-result"]');
            const urlPath = parent.find('h2 a').attr('href');
            if (urlPath) {
                bestSellerUrl = `https://www.amazon.com${urlPath}`;
                return false;
            }
        }
    });

    return bestSellerUrl;
}
async function fetchAndReadReviews(productUrl) {
    try {
        const response = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const $ = cheerio.load(response.data);
        const reviews = $('.review-text-content span').map((i, el) => $(el).text().trim()).get().slice(0, 10);
        return reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}


app.get('/search', async (req, res) => {
    const productName = req.query.product;

    // Fetch search results
    const searchResultsHtml = await fetchSearchResults(productName);
    if (!searchResultsHtml) {
        res.status(500).json({ error: 'Failed to fetch search results' });
        return;
    }

    // Find bestseller
    const bestSellerUrl = await findBestSeller(searchResultsHtml);
    if (!bestSellerUrl) {
        res.status(404).json({ error: 'No Best Seller found' });
        return;
    }

    // Fetch and read reviews
    const reviews = await fetchAndReadReviews(bestSellerUrl);
    res.json({ bestSellerUrl, reviews });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
