const quantities = {
    day: 1,
    month: 30,
    year: 365
};

function getDurations(durationString) {

    console.log(`Started processing`, durationString);
    
    // Preprocessing
    let preprocessors= [
        (t => t.split('\n').map(u => u.trim()).join(" ")),  // Remove newlines
        (t => t.trim()),                                    // Trim whitespaces
        (t => t.replaceAll(/ *\([^)]*\) */g, "")),          // Remove content in paranthesis
        (t => t.replaceAll("*","")),                        // Remove asterisks
        (t => t.toLowerCase()),                             // Convert to lower case
        (t => t.replace('–', '-')),                         // Windows vs linux encoding for hyphen
        (t => t.trim())                                     // Trim whitespaces again
    ];
    let preprocessed = preprocessors.reduce((acc, curr) => ([acc].map(curr))[0], durationString);

    console.log('Preprocessed', preprocessed)

    // Matches 1 day, 2 months, 3 year etc.
    let unaryMatch = preprocessed.match(/^(\d+)\s+(day|month|year)(?:s)?(\sonly)?$/);
    if (unaryMatch) {
        console.log('Unary match!')
        let num = parseInt(unaryMatch[1], 10);
        let unit = unaryMatch[2];
        let multiplier = quantities[unit];
        
        if (num <= 0) throw new Error(`Expected positive int for ${durationString}`);
        if(!multiplier) throw new Error(`Found unexpected unit for ${durationString}`);
        let duration = computeDurationInDays([{num: num, unit: unit}]);
        return [{min: duration, max: duration}];
    }

    // Matches above ... or > ...; just find the duration for the second part and increment min
    console.log(preprocessed);
    let prefixMatch = preprocessed.match(/^(above|>)\s*(.*)$/);
    if (prefixMatch) {
        console.log('Prefix match!')
        return getDurations(prefixMatch[2]).map(t => {
            let ret = {...t};
            ret.min++;
            return ret;
        });
    }
    
    // Matches 5 years and above
    let unboundedMatch = preprocessed.match(/^(\d+)\s+(day|month|year)(?:s)?(\sand\sabove)$/);
    if (unboundedMatch) {
        console.log('Unbounded match!')
        let num = parseInt(unboundedMatch[1], 10);
        let unit = unboundedMatch[2];
        let multiplier = quantities[unit];
        
        if (num <= 0) throw new Error(`Expected positive int for ${durationString}`);
        if(!multiplier) throw new Error(`Found unexpected unit for ${durationString}`);
        return [{min: computeDurationInDays([{num: num, unit: unit}]), max: 3650}];
    }
    // Matches special case for 355 days or 364 days. Hardcoded to two entries only
    // This is mostly a bug - should be to instead of or
    let specialOrMatch = preprocessed.match(/^(\d+)\s*(day|month|year)(?:s)?\sor\s(\d+)\s*(day|month|year)(?:s)?$/);
    if (specialOrMatch) {
        console.log('Special match!')
        return getDurations(`${specialOrMatch[1]} ${specialOrMatch[2]} to ${specialOrMatch[3]} ${specialOrMatch[4]}`);
    }

    console.log('Normal match!')

    // Regular binary cases default
    let processors = [
        t => t.replace('years-', 'years'),
        t => t.replace('and above upto and inclusive of', '-'),
        t => t.replace('- & less than', '<'),
        t => t.replace('- less than', '<'),
        t => t.replace('and less than', '<'),
        t => t.replace('but less than', '<'),
        t => t.replace('to below', '<'),
        t => t.replace('< =', '-'),
        t => t.replace('to <', '<'),
        t => t.replace('to less than', '<'),
        t => t.replace('& above',''),
        t => t.replace('and above',''),
        t => t.replace('and up to', '-'),
        t => t.replace('up to', '-'),
        t => t.replace('and up', ''),
        t => t.replace('to', '-'),
        t => t.replace('less than', '<')
    ];
    let processed = processors.reduce((acc, curr) => ([acc].map(curr))[0], preprocessed);
    let hyphenIdx = processed.indexOf('-');
    let bracketIdx = processed.indexOf('<');
    if (hyphenIdx === -1 && bracketIdx === -1) throw new Error(`Did not find - or < in ` + durationString);
    if (hyphenIdx !== -1 && bracketIdx !== -1) throw new Error(`Found - and < in ` + durationString);
    let splits = processed.split(hyphenIdx === -1 ? '<' : '-').map(t => t.trim());
    if (splits.length > 2) throw new Error(`Found multiple - or < in ${durationString}`);
    let lhsDurations = parseDuration(splits[0]);
    let rhsDurations = parseDuration(splits[1]);
    // Validations

    if (lhsDurations.length === 0 || rhsDurations.length === 0) throw new Error(`LHS/RHS len 0 for ${durationString}`);
    
    // Test for 7-14 days
    if (lhsDurations.length === 1 && !lhsDurations[0].unit) {
        if (rhsDurations.length > 1) throw new Error(`RHS must be 1 if only LHS entry has no unit for ${durationString}`);
        lhsDurations[0].unit = rhsDurations[0].unit;
    }
    let lhsComputed = computeDurationInDays(lhsDurations);
    let rhsComputed = computeDurationInDays(rhsDurations) - (bracketIdx > 0 ? 1 : 0);
    if (rhsComputed < lhsComputed) throw new Error(`RHS < LHS for ${durationString}`);
    
    return [{min: lhsComputed, max: rhsComputed}];
}

function computeDurationInDays(durations) {
    return durations.map(d => {
        if (d.unit === 'day') return d.num;
        if (d.unit === 'month') {
            let quot = Math.floor(d.num / 12);
            let rem = d.num % 12;
            return quantities['year'] * quot + quantities[d.unit] * rem;
        }
        if (d.unit === 'year') return d.num * quantities[d.unit];
        throw new Error(`Unknown unit ${d.unit} for ${d}`);
    }).reduce((a, b) => a + b, 0);
}

function parseDuration(oneside) {
    if (oneside.match(/^\d+$/)) {
        return [{num: parseInt(oneside, 10)}];
    }

    let processed = oneside
        .split(" ")
        .map(t => t.trim())
        .filter(t => t);
    
    if (processed.length %2 !== 0) throw new Error(`Found odd number of tokens in ${oneside}`);

    let ret = [];

    for (let idx = 0; idx < processed.length; idx++) {
        const num = parseInt(processed[idx], 10);
        const unit = processed[++idx].replaceAll('s', '');

        ret.push({num: num, unit: unit});
    }

    return ret;
}

const getPercentage = (rateStr) => {
    return parseFloat(rateStr.replace('%', '').trim());
};

module.exports = {
    getDurations: getDurations,
    getPercentage: getPercentage
};