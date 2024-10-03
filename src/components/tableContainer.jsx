import SortableTableComponent from './sortableTableComponent';
import UpdateTS from './data/updated';

function removeTime(dateString) {
    return dateString.split(' ').slice(1, 4).join(" ");
}

export default function TableContainer({ data, min, max, bank }) {

    let filtered = JSON.parse(data)
        .filter(d => d.min >= (min || -1))
        .filter(d => d.max <= (max || 4000))
        .filter(d => (bank ? d.bank === bank : true))
    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0px', alignContent: 'center' }}>
            Latest FD Rates {bank && ` for ${bank} ` } (&lt; 3 CR). Updated {removeTime(UpdateTS)}
            {bank && <><br/><a href="/">See rates for all banks</a></>}
            <SortableTableComponent data={filtered} selectedBank={bank} />
        </div>
    );
}