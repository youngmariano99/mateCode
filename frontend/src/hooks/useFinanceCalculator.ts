import { useState, useMemo } from 'react';

export interface QuoteItem {
    id: string;
    title: string;
    price: number;
    enabled: boolean;
}

export const useFinanceCalculator = (initialItems: QuoteItem[]) => {
    const [items, setItems] = useState<QuoteItem[]>(initialItems);
    const [taxRate, setTaxRate] = useState<number>(0); // e.g. 0.21 for IVA
    const [advancePercent, setAdvancePercent] = useState<number>(50);

    const subtotal = useMemo(() => {
        return items
            .filter(i => i.enabled)
            .reduce((sum, item) => sum + item.price, 0);
    }, [items]);

    const taxes = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
    const total = useMemo(() => subtotal + taxes, [subtotal, taxes]);

    const advancePayment = useMemo(() => {
        return (total * advancePercent) / 100;
    }, [total, advancePercent]);

    const toggleItem = (id: string) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
    };

    const updatePrice = (id: string, price: number) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, price: Math.max(0, price) } : item
        ));
    };

    return {
        items,
        subtotal,
        taxes,
        total,
        advancePayment,
        advancePercent,
        setAdvancePercent,
        setTaxRate,
        toggleItem,
        updatePrice
    };
};
