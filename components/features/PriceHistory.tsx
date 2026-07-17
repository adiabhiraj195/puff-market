import React, { useState } from "react";
import { AiOutlineClockCircle, AiOutlineLineChart } from "react-icons/ai";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

const PriceHistory: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 text-white rounded-2xl p-5 w-full shadow-xl my-5">
            {/* Header */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left focus:outline-none cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <AiOutlineLineChart size={20} className="text-blue-400" />
                    <h2 className="text-lg font-semibold tracking-tight">Price History</h2>
                </div>
                {isOpen ? (
                    <IoIosArrowUp size={18} className="text-neutral-400 hover:text-white transition-colors" />
                ) : (
                    <IoIosArrowDown size={18} className="text-neutral-400 hover:text-white transition-colors" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="flex flex-col items-center justify-center h-44 text-neutral-400 mt-6 border-t border-neutral-800/60 pt-6 animate-fadeIn">
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/60 rounded-2xl mb-3 text-neutral-500">
                        <AiOutlineClockCircle size={32} />
                    </div>
                    <p className="font-semibold text-white text-sm">No price activity yet</p>
                    <p className="text-xs text-neutral-500 mt-1">This token hasn&apos;t been traded yet.</p>
                </div>
            )}
        </div>
    );
};

export default PriceHistory;