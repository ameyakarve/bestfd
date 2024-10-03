const axios = require('axios');
const { getDurations } = require('./utils');

// URL of the JS file to download
const url = 'https://www.icicibank.com/content/dam/icicibank/india/managed-assets/revamp-pages/fixed-deposits-all-pages/script/retail-new-data.js';

async function fetchICICIData() {
    const response = await axios.get(url);
    const jsFileContent = response.data;

    // Array to store the formatted data
    const formattedData = [];

    let replaced = (jsFileContent.split("\n")) // Split lines
        .map(t => t.trim())                    // Trim
        .map(t => t.replace(/\/\/.*/, ''))     // Remove single line comments
        .filter(u => u)                        // Remove empty lines
        .filter(u => u.indexOf('\/\/') !== 0)  // Is this even needed?
        .join("");
    // Regex to match the interestData array from the JS file
    const regex = /interestData\s=\s\[(\[.*?\])/g;

    const match = (regex.exec(replaced));
    let json = (match[1].replaceAll('tenure', '"tenure"').replaceAll('c1', '"c1"').replaceAll('c2', '"c2"').replaceAll('c3', '"c3"').replaceAll('c4', '"c4"').replace(',]', ']'));
    let entries = JSON.parse(json);
    entries.forEach(el => {
        if (el.tenure.indexOf('Tax Saver') !== -1) return;
        let durations = getDurations(el.tenure);
        durations.forEach(duration => {
            let ret = {
                bank: 'ICICI Bank',
                min: duration.min,
                max: duration.max,
                regular: el.c1,
                senior: el.c2
            };
            formattedData.push(ret);
        })
    });

    return formattedData;
}

module.exports = fetchICICIData;