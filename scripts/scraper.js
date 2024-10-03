const fs = require('fs');
const scrapers = {
    'hdfc': require('./hdfc'),
    'icici': require('./icici'),
    'sbi': require('./sbi'),
    'axis': require('./axis'),
    'kotak': require('./kotak'),
    'bob': require('./bob'),
    'pnb': require('./pnb'),
    'indus': require('./indus'),
    'iob': require('./iob'),
    'canara': require('./canara'),
    'idfc': require('./idfc')
};

async function scrape() {
    let allData = [];
    let keys = Object.keys(scrapers);
    for (let idx = 0; idx < keys.length; idx++) {
        const scraper = scrapers[keys[idx]];
        let data = await scraper();
        data.forEach(element => {
            allData.push(element);
        });
    }
    fs.writeFileSync('./src/components/data/allData.js', `export default '${JSON.stringify(allData)}';`);
    fs.writeFileSync('./src/components/data/updated.js', `export default '${convertTZ(new Date(Date.now()))}';`);
}

function convertTZ(date) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric", timeZone: 'Asia/Kolkata'}));   
}


scrape();