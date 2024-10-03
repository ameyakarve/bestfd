import React, { useState } from 'react';

const TimeRangeChips = () => {
    // Define the time range options
    const chipValues = ["< 3 mo", "3 - 6 mo", "6mo-1y", "1y-3y", ">3y"];
    
    // State to track the selected chip, defaulting to the first chip
    const [selectedChip, setSelectedChip] = useState(0);

    // Material-style inline styles for the chips
    const chipContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        marginBottom: '16px',
    };

    const chipStyle = (isSelected) => ({
        flex: 1,
        padding: '8px',
        borderRadius: '16px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#6200ea' : '#f1f1f1',
        color: isSelected ? '#fff' : '#333',
        fontSize: '14px',
        boxShadow: isSelected ? '0 2px 6px rgba(0, 0, 0, 0.2)' : 'none',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        border: 'none',
    });

    // Function to handle the chip click and set the selected one
    const handleChipClick = (index) => {
        setSelectedChip(index);
    };

    return (
        <div style={chipContainerStyle}>
            {chipValues.map((value, index) => (
                <button
                    key={index}
                    style={chipStyle(selectedChip === index)}
                    onClick={() => handleChipClick(index)}
                >
                    {value}
                </button>
            ))}
        </div>
    );
};

export default TimeRangeChips;
