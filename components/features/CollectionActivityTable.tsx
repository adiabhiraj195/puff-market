import React from 'react';
import { FiExternalLink } from 'react-icons/fi';

interface CollectionHistory {
  id: string;
  tokenId: string;
  nftName: string;
  from: string;
  to: string;
  type: string;
  price: string | null;
  txHash: string;
  timestamp: string;
}

interface CollectionActivityTableProps {
  history: CollectionHistory[];
  formatAddress: (addr: string) => string;
}

export default function CollectionActivityTable({
  history,
  formatAddress
}: CollectionActivityTableProps) {
  return (
    <div className="bg-[#0c0d11]/45 border border-zinc-800/60 rounded-2xl backdrop-blur-sm shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-auto text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-550 uppercase font-black tracking-widest bg-zinc-950/30">
              <th className="py-4 px-6">Event</th>
              <th className="py-4 px-4">Item</th>
              <th className="py-4 px-4">Price</th>
              <th className="py-4 px-4">From</th>
              <th className="py-4 px-4">To</th>
              <th className="py-4 px-6 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {history.map((tx) => {
              let badgeStyle = "bg-zinc-800 text-zinc-400";
              if (tx.type === "MINT") badgeStyle = "bg-green-500/10 text-green-400 border border-green-500/20";
              else if (tx.type === "SALE") badgeStyle = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
              else if (tx.type === "AUCTION") badgeStyle = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

              return (
                <tr key={tx.id} className="hover:bg-zinc-900/15 transition-colors align-middle text-sm text-zinc-300">
                  <td className="py-4.5 px-6">
                    <span className={`inline-flex px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-md ${badgeStyle}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4.5 px-4 font-bold text-white">
                    {tx.nftName || `NFT #${tx.tokenId}`}
                    <span className="text-zinc-500 text-[10px] ml-1.5 font-mono">#{tx.tokenId}</span>
                  </td>
                  <td className="py-4.5 px-4 font-mono font-bold text-yellow-400">
                    {tx.price ? `${Number(tx.price).toLocaleString()} PUFF` : "—"}
                  </td>
                  <td className="py-4.5 px-4 font-mono text-xs">
                    {tx.from === "0x0000000000000000000000000000000000000000" ? "NullAddress" : formatAddress(tx.from)}
                  </td>
                  <td className="py-4.5 px-4 font-mono text-xs">
                    {formatAddress(tx.to)}
                  </td>
                  <td className="py-4.5 px-6 text-right text-xs text-zinc-500 flex flex-col items-end gap-1.5">
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                    <a 
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-zinc-500 hover:text-indigo-400 underline flex items-center gap-0.5"
                    >
                      Tx <FiExternalLink size={8} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
