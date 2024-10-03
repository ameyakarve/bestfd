const axios = require('axios');
const cheerio = require('cheerio');
const { getDurations, getPercentage } = require('./utils');

// URL to download the HTML from PNB FD interest rates page
const url = 'https://www.pnbindia.in/Interest-Rates-Deposit.html';

async function fetchKotakData() {
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Array to store the formatted data
    const formattedData = [];

    // Find the first table
    // const table = $('table').first();
    var found = false;

    $('table').each((i, table) => {
        if (found) return;
        let innerHtml = $(table).html();
        if (innerHtml.indexOf('Domestic/NRO $ Fixed Deposit Scheme') !== -1) {
            found = true;
            $(table).find('tbody tr').each((i, tr) => {
                // Extract Tenor Bucket, Regular Rate, and Senior Citizen Rate
                const tenorBucket = $(tr).find('td').eq(1).text().trim();
                const regularRate = getPercentage($(tr).find('td').eq(2).text().trim());
                const seniorRate = getPercentage($(tr).find('td').eq(3).text().trim());
                if (!(tenorBucket.trim())) return;
                if(tenorBucket.indexOf('Period') !== -1) return;
                
                let durations = getDurations(tenorBucket);
                durations.forEach(d => {
                    let {min, max} = d;
                    if (!isNaN(regularRate) && !isNaN(seniorRate)) {
                        let ret = {
                            bank: 'PNB',
                            min: min,
                            max: max,
                            regular: regularRate,
                            senior: seniorRate
                        };
                        // Add row data to the formatted data array
                        formattedData.push(ret);
                    }
                });
            });
        }
        
    });

    // Iterate over rows in the table
    

    if (formattedData.length === 0) throw new Error('No data found for PNB');
    return formattedData;
};

module.exports = fetchKotakData;