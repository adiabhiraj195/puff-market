import React, { useState } from 'react';
import { TransactionInterface } from '@/types/transaction-types';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { FiCopy, FiExternalLink } from 'react-icons/fi';

interface TransactionHistoryProps {
    transactions?: TransactionInterface[];
}

const TransactionHistory = ({ transactions = [] }: TransactionHistoryProps) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied to clipboard!`);
    };

    const formatAddress = (addr?: string) => {
        if (!addr) return '--';
        return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    };

    const formatDate = (dateInput: Date | string) => {
        try {
            const date = new Date(dateInput);
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '--';
        }
    };

    return (
        <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 text-white rounded-2xl p-5 w-full shadow-xl my-5">
            {/* Header */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left focus:outline-none cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <span className="text-blue-400">📊</span>
                    <h2 className="text-lg font-semibold tracking-tight">Item Activity</h2>
                </div>
                {isOpen ? (
                    <IoIosArrowUp size={18} className="text-neutral-400 hover:text-white transition-colors" />
                ) : (
                    <IoIosArrowDown size={18} className="text-neutral-400 hover:text-white transition-colors" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="mt-5 border-t border-neutral-800/60 pt-5">
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-44 text-neutral-400 py-6 animate-fadeIn">
                            <div className="p-3 bg-neutral-900/60 border border-neutral-800/60 rounded-2xl mb-3 text-neutral-500">
                                <AiOutlineClockCircle size={32} />
                            </div>
                            <p className="font-semibold text-white text-sm">No activity recorded</p>
                            <p className="text-xs text-neutral-500 mt-1">This token hasn&apos;t had any market events yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse text-left text-sm">
                                <thead>
                                    <tr className="text-neutral-400 text-xs font-semibold uppercase tracking-wider border-b border-neutral-800 pb-3">
                                        <th className="px-4 py-3 font-semibold">Event</th>
                                        <th className="px-4 py-3 font-semibold">Price</th>
                                        <th className="px-4 py-3 font-semibold">From</th>
                                        <th className="px-4 py-3 font-semibold">To</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold text-right">Tx</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                            className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-3.5 font-medium flex items-center gap-2">
                                                <span className="text-emerald-400">🛒</span>
                                                <span>Sale</span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-white">
                                                {Number(item.price).toLocaleString()} PUFF
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button
                                                    onClick={() => handleCopy(item.seller?.address || '', 'Seller address')}
                                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline cursor-pointer focus:outline-none"
                                                >
                                                    {formatAddress(item.seller?.address)}
                                                    <FiCopy size={11} className="opacity-50" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button
                                                    onClick={() => handleCopy(item.buyer?.address || '', 'Buyer address')}
                                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline cursor-pointer focus:outline-none"
                                                >
                                                    {formatAddress(item.buyer?.address)}
                                                    <FiCopy size={11} className="opacity-50" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5 text-neutral-400">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                {item.transactionHash ? (
                                                    <button
                                                        onClick={() => handleCopy(item.transactionHash, 'Tx hash')}
                                                        className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                                        title="Copy Tx Hash"
                                                    >
                                                        {item.transactionHash.slice(0, 4)}...
                                                        <FiCopy size={11} className="opacity-55" />
                                                    </button>
                                                ) : (
                                                    <span className="text-neutral-600">--</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;

