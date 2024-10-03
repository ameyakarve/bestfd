const axios = require('axios');
const cheerio = require('cheerio');
const { getDurations, getPercentage } = require('./utils');

// URL to download the HTML from Indus FD interest rates page
const url = 'https://www.indusind.com/in/en/personal/fixed-deposit-interest-rate.html';

async function fetchKotakData() {
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Array to store the formatted data
    const formattedData = [];

    const table = $('table')[0]; // Select the first table
    if (!table) {
        throw new Error('Could not find tables for indus');
    }

    const rows = $('tbody tr', table).toArray();

    rows.forEach(row => {
        const cols = $('td, th', row);
        if (cols.length === 3) {
            const tenure = cols.eq(0).text().trim();
            const normalRate = getPercentage(cols.eq(1).text());
            const seniorCitizenRate = getPercentage(cols.eq(2).text());

            if (tenure.indexOf('Tenure') !== -1) return;
            if (tenure.indexOf('Indus Tax Saver Scheme') !== -1) return;
            
            const durations = getDurations(tenure);
            durations.forEach(d => {
                if (!d) {
                    return;
                }
                let {min, max} = d;
                if (!isNaN(normalRate) && !isNaN(seniorCitizenRate) && min !== null && max !== null) {
                    let ret = {
                        bank: 'IndusInd Bank',
                        min: min,
                        max: max,
                        regular: normalRate,
                        senior: seniorCitizenRate
                    };
                    
                    // Add row data to the formatted data array
                    formattedData.push(ret);
                }
            })
        }
    });
 
    // Iterate over rows in the table
    

    if (formattedData.length === 0) throw new Error('No data found for Indus');
    return formattedData;
};

module.exports = fetchKotakData;