const axios = require('axios');
const cheerio = require('cheerio');
const { getDurations, getPercentage } = require('./utils');

// URL to download the HTML from BOB FD interest rates page
const url = 'https://www.kotak.com/bank/mailers/intrates/get_all_variable_data_latest.php?section=NRO_Term_Deposit';

async function fetchKotakData() {
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Array to store the formatted data
    const formattedData = [];

    // Find the first table
    const table = $('table').first();

    console.log(table.html());

    // Iterate over rows in the table
    table.find('tbody tr').each((i, tr) => {
        // Extract Tenor Bucket, Regular Rate, and Senior Citizen Rate
        const tenorBucket = $(tr).find('td').eq(0).text().trim();
        const regularRate = getPercentage($(tr).find('td').eq(1).text().trim());
        const seniorRate = getPercentage($(tr).find('td').eq(2).text().trim());
        if (!(tenorBucket.trim())) return;
        if(tenorBucket.indexOf('Fixed Deposits Interest Rates for Domestic/ NRO / NRE') !== -1) return;
        if(tenorBucket.indexOf('Premature Withdrawal Allowed') !== -1) return;

        let durations = getDurations(tenorBucket);
        durations.forEach(d => {
            let {min, max} = d;
            if (!isNaN(regularRate) && !isNaN(seniorRate)) {
                let ret = {
                    bank: 'Bank of Baroda',
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

    if (formattedData.length === 0) throw new Error('No data found for BoB');
    return formattedData;
};

module.exports = fetchKotakData;