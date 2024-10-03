const axios = require('axios');
const cheerio = require('cheerio');
const { getDurations, getPercentage } = require('./utils');

// URL for the SBI deposit rates page
const url = 'https://sbi.co.in/web/interest-rates/deposit-rates/retail-domestic-term-deposits';

async function fetchSbiData() {
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Array to store the formatted data
    const formattedData = [];

    $('table').each((i, table) => {
        if ($(table).text().includes('7 days to 45 days')) {
            // Extract rows
            $(table).find('tbody tr').each((i, tr) => {
                // Extract the tenor bucket, regular rate, and senior citizen rate
                const tenorBucket = $(tr).find('td').eq(0).text().trim();
                const regularRate = $(tr).find('td').eq(1).text().trim();
                const seniorRate = $(tr).find('td').eq(2).text().trim();

                let durations = getDurations(tenorBucket);
                // Convert rates to float
                const regularRateFloat = getPercentage(regularRate);
                const seniorRateFloat = getPercentage(seniorRate);

                durations.forEach(d => {
                    let {min, max} = d;
                    if (!isNaN(regularRateFloat) && !isNaN(seniorRateFloat)) {
                        let ret = {
                            bank: 'State Bank of India',
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
    if (formattedData.length === 0) throw new Error('No data found for SBI');
    return formattedData;

};

module.exports = fetchSbiData;