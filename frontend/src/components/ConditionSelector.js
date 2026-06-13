import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ConditionSelector = ({ selectedConditions, onChange }) => {
    // Dinamik olarak backend'den dolacak liste
    const [availableConditions, setAvailableConditions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false); // Menü açıklık durumu
    const wrapperRef = useRef(null); // Dışarı tıklamayı yakalamak için referans

    // Bileşen ekrana geldiğinde API'den hastalıkları çek
    useEffect(() => {
        axios.get('https://med-drug-backend.onrender.com/api/conditions', { withCredentials: true })
            .then(res => setAvailableConditions(res.data))
            .catch(err => console.error("Hastalıklar yüklenemedi:", err));
    }, []);

    // Dışarı tıklanıp tıklanmadığını dinleyen effect
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleAdd = (condition) => {
        if (!selectedConditions.includes(condition)) {
            onChange([...selectedConditions, condition]);
        }
        setInputValue("");
        setIsOpen(false);
    };

    const handleRemove = (conditionToRemove) => {
        onChange(selectedConditions.filter(c => c !== conditionToRemove));
    };

    // Filtreleme: Dinamik listeyi kullanıyoruz (Case insensitive)
    const filteredConditions = availableConditions.filter(c =>
        c.toLowerCase().startsWith(inputValue.toLowerCase()) &&
        !selectedConditions.includes(c)
    );

    // Arayüzde alt çizgiyi boşluğa çeviren yardımcı fonksiyon
    const formatName = (name) => name.replace(/_/g, ' ');

    return (
        <div className="condition-selector" ref={wrapperRef}>
            <div className="selected-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {selectedConditions.map(cond => (
                    <span key={cond} style={{ padding: '5px 12px', backgroundColor: '#e2e8f0', borderRadius: '15px', fontSize: '0.85rem', color: '#1a3d2b', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                        {formatName(cond)}
                        <button type="button" onClick={() => handleRemove(cond)} style={{ marginLeft: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', padding: 0 }}>✕</button>
                    </span>
                ))}
            </div>

            <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search conditions (e.g., diabetes)"
                    value={inputValue}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '0.95rem' }}
                />

                {isOpen && filteredConditions.length > 0 && (
                    <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #d1d5db', borderRadius: '0 0 8px 8px', listStyle: 'none', padding: 0, margin: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        {filteredConditions.map(cond => (
                            <li
                                key={cond}
                                onClick={() => handleAdd(cond)}
                                style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#374151', fontSize: '0.9rem' }}
                            >
                                {formatName(cond)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConditionSelector;