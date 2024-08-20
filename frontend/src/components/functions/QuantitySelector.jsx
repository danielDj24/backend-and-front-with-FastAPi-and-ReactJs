import React, { useState } from 'react';

const QuantitySelector = ({ initialQuantity,maxQuantity, onQuantityChange }) => {
    const [quantity, setQuantity] = useState(initialQuantity || 1);

    const handleIncrement = () => {
        if (quantity < maxQuantity) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            onQuantityChange(newQuantity);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            onQuantityChange(newQuantity);
        }
    };

    const handleInputChange = (e) => {
        const value = Math.max(1, Math.min(maxQuantity, parseInt(e.target.value, 10) || 1));
        setQuantity(value);
        onQuantityChange(value);
    };
    
    return (
        <div className="quantity-selector-container">
            <button className="btn btn-light" onClick={handleDecrement}>-</button>
            <input
                type="number"
                value={quantity}
                min="1"
                max={maxQuantity}
                onChange={handleInputChange}
                className="quantity-input"
            />
            <button  className="btn btn-light" onClick={handleIncrement}>+</button>
        </div>
    );
};

export default QuantitySelector;
