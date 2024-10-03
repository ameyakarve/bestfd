const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { getDurations } = require('./utils');

async function downloadPDF(url, outputPath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

function firstIdxOfDepositAmt(lines) {
    for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (line.indexOf('DEPOSITS – LESS THAN ₹ 5 CRORES') === 0) return idx;
    }
    return -1;
}

// Function to get the PDF link from the Axis Bank FD webpage
async function getPDFLinkFromWebpage() {
    const url = 'https://www.axisbank.com/fixed-deposit-interest-rate';
    const response = await axios.get(url);
    // Load the HTML into Cheerio
    const $ = cheerio.load(response.data);
    // Extract the PDF link using the selector 'a.FDlink'
    const pdfLink = $('a.FDlink').attr('href');
    if (!pdfLink) {
        throw new Error('PDF link not found on the webpage');
    }
    return `https://www.axisbank.com${pdfLink}`;
}

// Function to extract FD data from PDF
async function extractFDDataFromPDF() {
    const pdfUrl = await getPDFLinkFromWebpage();
    var dir = './tmp';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    const pdfPath = './tmp/axis-fd-rates.pdf';
    // Download the PDF file
    console.log('Downloading PDF...');
    await downloadPDF(pdfUrl, pdfPath);

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    let lines = text.split("\n").map(t => t.trim()).filter(t => t);
    let firstIdx = lines.indexOf('Less than ₹ 5 Cr');
    let startIdx = 1 + lines.indexOf('Less than ₹ 5 Cr', firstIdx + 1);
    let firstEndIdx = lines.indexOf('Please clear browser history/cookies before accessing the interest rate chart in order to view the latest effective interest');
    let endIdx = lines.indexOf('Please clear browser history/cookies before accessing the interest rate chart in order to view the latest effective interest', firstEndIdx + 1);
    let fiveCroreIdx = firstIdxOfDepositAmt(lines);

    if (startIdx < 0 || endIdx < 0) {
        throw new Error("Could not find indices");
    }
    if ((endIdx - startIdx) % 2 !== 0) {
        throw new Error("Found odd number of entries");
    }
    if (fiveCroreIdx >= startIdx || fiveCroreIdx >= endIdx) {
        throw new Error("Could not find 5CR index " + fiveCroreIdx);
    }

    let selectedLines = lines.slice(startIdx, endIdx);
    console.log(selectedLines);
    const formattedData = [];

    for (let idx = 0; idx < selectedLines.length; idx++) {
        const line = selectedLines[idx];
        let durations = getDurations(line);
        idx++;
        let splits = selectedLines[idx].split(" ").map(parseFloat);
        // console.log(minMax, splits[0], splits[2]);
        durations.forEach(d => {
            let { min, max } = d;
            if (!isNaN(splits[0]) && !isNaN(splits[1])) {
                let ret = {
                    bank: 'Axis Bank',
                    min: min,
                    max: max,
                    regular: splits[0],
                    senior: splits[1]
                };

                // Add row data to the formatted data array
                formattedData.push(ret);
            }
        });
    }

    return formattedData;
}

module.exports = extractFDDataFromPDF;