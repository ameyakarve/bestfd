const axios = require('axios');
const cheerio = require('cheerio');
const { getDurations, getPercentage } = require('./utils');

// URL to download the HTML from IOB FD interest rates page
const url = 'https://canarabank.com/pages/deposit-interest-rates';

async function fetchCanaraData() {
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Array to store the formatted data
    const formattedData = [];
    $('table').each((i, table) => {
        if ($(table).html().includes('Deposits less than Rs.3 Crore')) {
            // Extract rows
            $(table).find('tbody tr').each((i, tr) => {
                // Extract the tenor bucket, regular rate, and senior citizen rate
                const tenorBucket = $(tr).find('td').eq(0).text().trim();
                const regularRate = $(tr).find('td').eq(1).text().trim();
                const seniorRate = $(tr).find('td').eq(3).text().trim();

                if (!tenorBucket.trim()) return;

                if (tenorBucket.indexOf('Term Deposits') !== -1) return;
                if (tenorBucket.indexOf('Rate of Interest') !== -1) return;

                let durations = getDurations(tenorBucket);
                // Convert rates to float
                const regularRateFloat = getPercentage(regularRate);
                const seniorRateFloat = getPercentage(seniorRate);

                durations.forEach(d => {
                    let {min, max} = d;
                    if (!isNaN(regularRateFloat) && !isNaN(seniorRateFloat)) {
                        let ret = {
                            bank: 'Canara Bank',
                            min: min,
                            max: max,
                            regular: regularRateFloat,
                            senior: seniorRateFloat
                        };
                        
                        // Add row data to the formatted data array
                        formattedData.push(ret);
                    }
                });
            });
        }
    });
    
    
 
    // Iterate over rows in the table
    

    if (formattedData.length === 0) throw new Error('No data found for Canara');
    return formattedData;
};

module.exports = fetchCanaraData;