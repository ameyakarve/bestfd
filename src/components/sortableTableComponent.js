import React, { useState, useEffect } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';

// Chips component with compact styling
const TimeRangeChips = ({ selectedRange, onRangeSelect }) => {
    const chipValues = ["< 3 mo", "3 - 6 mo", "6mo-1y", "1y-3y", ">3y"];

    const chipContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '4px',
        marginBottom: '8px',
    };

    const chipStyle = (isSelected) => ({
        flex: 1,
        padding: '4px 6px',
        borderRadius: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#4978e3' : '#c8c8c8',
        color: isSelected ? '#fff' : '#333',
        fontSize: '12px',
        boxShadow: isSelected ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        border: 'none',
    });

    return (
        <div style={chipContainerStyle}>
            {chipValues.map((value, index) => (
                <button
                    key={index}
                    style={chipStyle(selectedRange === index)}
                    onClick={() => onRangeSelect(index)}
                >
                    {value}
                </button>
            ))}
        </div>
    );
};

const SortableTableComponent = ({ data, selectedBank }) => {
    const isBrowser = useIsBrowser();
    const [sortColumn, setSortColumn] = useState('regular');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterBank, setFilterBank] = useState('');
    const [filterDays, setFilterDays] = useState('');
    const [selectedRange, setSelectedRange] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [width, setWidth] = useState(isBrowser ? window.innerWidth : 768);
    const [itemsPerPage, setItemsPerPage] = useState(0);

    const links = {
        'ICICI Bank': 'icici',
        'HDFC Bank': 'hdfc',
        'State Bank of India': 'sbi',
        'Axis Bank': 'axis',
        'Bank of Baroda': 'bob',
        'Canara Bank': 'canara',
        'IndusInd Bank': 'indus',
        'IOB': 'iob',
        'Kotak Mahindra': 'kotak',
        'PNB': 'pnb',
        'IDFC First Bank': 'idfc'
    };

    if (selectedBank) {
        data = data.filter(d => d.bank === selectedBank);
    }

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const viewportHeight = window.innerHeight;
            // Adjust the following values based on your table row height and other elements
            const headerHeight = 170; // Approximate header height (including filters)
            const paginationHeight = 60; // Approximate pagination height
            const rowHeight = 50; // Approximate row height

            const availableHeight = viewportHeight - headerHeight - paginationHeight;
            const calculatedItemsPerPage = Math.floor(availableHeight / rowHeight);

            // Set a minimum number of items per page (e.g., 5)
            setItemsPerPage(Math.max(calculatedItemsPerPage, 5));
        };

        calculateItemsPerPage(); // Calculate initially
        window.addEventListener('resize', calculateItemsPerPage); // Recalculate on resize

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', calculateItemsPerPage);
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortColumn(column);
            setSortOrder('desc');
        }
    };

    const daysString = (days) => {
        if (days < 365) return `${days}d`;
        let years = Math.floor(days / 365);
        let residue = days % 365;
        if (residue === 0) return `${years}y`;
        return `${years}y ${residue}d`;
    };

    const ranges = [
        [-1, 91],
        [90, 181],
        [180, 366],
        [365, 1096],
        [1095, 365000]
    ];

    const filteredData = data.filter((row) => {
        if (selectedBank) return true;
        const bankMatch = row.bank.toLowerCase().includes(filterBank.toLowerCase());
        const daysMatch = !filterDays || (parseInt(filterDays, 10) >= row.min && parseInt(filterDays, 10) <= row.max);
        const range = ranges[selectedRange];
        // Interval matching problem
        const rangeMatch = !(row.max < range[0] || row.min > range[1]);
        return bankMatch && daysMatch && rangeMatch;
    });

    const sortedData = [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === 'string') {
            return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        } else {
            return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        }
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterBank, filterDays, selectedRange]);

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#333',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
        borderRadius: '8px', // Add border-radius
        boxShadow: 'transparent'

    };

    const thStyle = {
        backgroundColor: '#636363',
        color: '#fff',
        padding: (width <= 768) ? '6px' : '8px',
        textAlign: 'center',
        fontWeight: '1200',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    };

    const tdStyle = {
        padding: '2px 5px 2px 5px',
        borderBottom: '1px solid #ddd',
        wordBreak: 'break-word',
        textAlign: 'center',
    };

    const filterTdStyle = {
        padding: '4px',
        backgroundColor: '#f2f2f2', // Add background to filter row
    };

    const tdFirstColumnStyle = {
        ...tdStyle,
        textAlign: 'right',
        padding: '2px',
        fontSize: '11px',
    };

    const buttonStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: '#fff',
        padding: '2px',
        width: '100%',
        justifyContent: 'space-between',
    };

    const firstButtonStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#fff',
        padding: '2px',
        width: '100%',
        justifyContent: 'space-between',
        textAlign: 'right',
        alignItems: 'right',
    };

    const arrowStyle = {
        fontSize: '12px',
        marginLeft: '6px',
        transition: 'transform 0.2s ease',
    };

    const filterInputStyle = {
        width: '100%',
        padding: '8px 4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    };

    const paginationStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#fafafa',
        borderTop: '1px solid #ddd',
    };

    // Updated pagination button style logic
    const getPageButtonStyle = (isDisabled) => ({
        margin: '0 6px',
        padding: '6px 10px',
        border: 'none',
        borderRadius: '20px',
        background: isDisabled ? '#ccc' : '#4978e3', // Update based on disabled state
        color: '#fff',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease',
    });

    const columnTitles = {
        bank: 'Bank',
        min: 'Min Time',
        max: 'Max Time',
        regular: 'Regular Rate',
        senior: 'Senior Citizen Rate',
    };

    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={tableStyle}>
                <thead style={{ backgroundColor: '#fff', borderRadius: '8px 8px 0 0' }}>
                    {!selectedBank &&
                        <tr>
                            <td colSpan={5} style={{ padding: '8px 2px 4px 2px', backgroundColor: '#e0e0e0' }}>
                                <TimeRangeChips
                                    selectedRange={selectedRange}
                                    onRangeSelect={(index) => setSelectedRange(index)}
                                />
                            </td>
                        </tr>
                    }
                    <tr>
                        {Object.entries(columnTitles).map(([key, title], idx) => (
                            <th key={key} style={thStyle}>
                                <button onClick={() => handleSort(key)} style={idx === 0 ? firstButtonStyle : buttonStyle}>
                                    <span>{title}</span>
                                    <span style={{ ...arrowStyle }}>
                                        {sortColumn === key ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                    </span>
                                </button>
                            </th>
                        ))}
                    </tr>

                    {!selectedBank && <tr>
                        <td colSpan={1} style={filterTdStyle}>
                            <input
                                type="text"
                                placeholder="Banks"
                                value={filterBank}
                                onChange={(e) => setFilterBank(e.target.value)}
                                style={filterInputStyle}
                            />
                        </td>
                        <td colSpan={2} style={filterTdStyle}>
                            <input
                                type="number"
                                placeholder="Time (days)"
                                value={filterDays}
                                onChange={(e) => setFilterDays(e.target.value)}
                                style={filterInputStyle}
                            />
                        </td>
                        <td colSpan={2}></td>
                    </tr>
                    }

                </thead>
                <tbody>
                    {currentItems.map((row, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                            <td style={tdFirstColumnStyle}>{selectedBank ? row.bank : <a href={`/${links[row.bank]}`}>{row.bank}</a>}</td>
                            <td style={tdStyle}>{daysString(row.min)}</td>
                            <td style={tdStyle}>{daysString(row.max)}</td>
                            <td style={tdStyle}>{row.regular}%</td>
                            <td style={tdStyle}>{row.senior}%</td>
                        </tr>
                    ))}
                    <tr><td colSpan={5} style={{ padding: '0px' }}>
                        <div style={paginationStyle}>
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={getPageButtonStyle(currentPage === 1)}
                            >
                                &lt;
                            </button>
                            <span style={{ margin: '0 10px', color: '#333' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={getPageButtonStyle(currentPage === totalPages)}
                            >
                                &gt;
                            </button>
                        </div>
                    </td>
                    </tr>
                    <tr style={{backgroundColor: 'transparent'}}>
                        <td colSpan={5}></td>
                    </tr>
                    <tr style={{backgroundColor: '#fafafa'}}>
                        <td colSpan={5}>
                            <h1>Best FD - Fixed Deposit interest rates across banks</h1>
                            <hr/>
                            <h2>FAQ</h2>
                            <hr/>
                            <p><strong>What does this table show?</strong></p>
                            <p>Our table displays current Fixed Deposit (FD) rates offered by top banks in India. It allows you to compare interest rates across different banks and tenure periods at a glance.</p>
                            <hr/>
                            <p><strong>What all banks do you have information for?</strong></p>
                            <p>Rates for the top 10 banks by market cap are available</p>
                            <hr/>
                            <p><strong>How frequently do you update the rates?</strong></p>
                            <p>We strive to update the rates daily. However, please note that banks may change their rates at any time. Always verify the current rates with the bank before making any decisions.</p>
                            <hr/>
                            <p><strong>Why did you build this?</strong></p>
                            <p>I have found it very painful to do the exercise of searching for rates across banks</p>
                            <hr/>
                            <p><strong>Using Our Comparison Tool</strong></p>
                            <br/>
                            <p><strong>How do I use the filter options?</strong></p>
                            <p> You can use the "Banks" filter to search for specific banks. The "Time (days)" filter allows you to input a specific number of days to see rates for that tenure across all banks.</p>
                            <hr/>
                            <p><strong>What do the time range chips (e.g., "&lt; 3 mo", "3 - 6 mo") do?</strong></p>
                            <p> These chips allow you to quickly filter the table to show FD rates for specific time ranges. For example, clicking on "3 - 6 mo" will show rates for Fixed Deposits with tenures between 3 and 6 months.</p>
                            <hr/>
                            <p><strong>Can I sort the data?</strong></p>
                            <p> Clicking a column sorts by that column. Clicking again changes the sort order</p>
                            <hr/>

                            
                        </td>
                    </tr>
                </tbody>
            </table>


        </div>
    );
};

export default SortableTableComponent;
