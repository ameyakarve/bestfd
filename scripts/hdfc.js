const axios = require('axios');
const cheerio = require('cheerio');
const { getPercentage, getDurations } = require('./utils');

// URL to download the HTML
const url = 'https://www.hdfcbank.com/personal/save/deposits/fixed-deposit-interest-rate';

async function fetchHdfcData() {
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Array to store the formatted data
    const formattedData = [];
    $('table.rates-table-main').each((i, table) => {
        // Check if the table has a header with "< 3 Crore"
        const tableHeading = $(table).find('tbody tr th').text().toLowerCase();

        // Check if the table heading contains "< 3 crore"
        if (tableHeading.includes('< 3 crore')) {
            // Process the rows within the table
            $(table).find('tbody tr').each((i, tr) => {
                
                // Extract Tenor Bucket, Regular Rate, and Senior Citizen Rate
                const tenorBucket = $(tr).find('td').eq(0).text().trim();
                if (!tenorBucket) return;
                const regularRate = $(tr).find('td').eq(1).text().trim();
                const seniorRate = $(tr).find('td').eq(2).text().trim();

                // Get the min and max durations using the getMinMaxDuration function
                const durations = getDurations(tenorBucket);
                
                // Convert the interest rates to floats
                const regularRateFloat = getPercentage(regularRate);
                const seniorRateFloat = getPercentage(seniorRate);
                durations.forEach(d => {
                    let {min, max} = d;
                    if (!isNaN(regularRateFloat) && !isNaN(seniorRateFloat)) {
                        let ret = {
                            bank: 'HDFC Bank',
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
    if (formattedData.length === 0) throw new Error('No data found for HDFC');
    return formattedData;
}

module.exports = fetchHdfcData;