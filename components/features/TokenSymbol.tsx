import React from 'react';
import { useReadContract } from 'wagmi';
import { PUFF_TOKEN_ADDRESS } from '@/constants/PuffToken';

interface TokenSymbolProps {
  address?: string;
}

export default function TokenSymbol({ address }: TokenSymbolProps) {
  const tokenAddress = address || "0x0000000000000000000000000000000000000000";
  const isEth = tokenAddress === "0x0000000000000000000000000000000000000000";
  const isPuff = !isEth && tokenAddress.toLowerCase() === PUFF_TOKEN_ADDRESS.toLowerCase();

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [{ constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }] as const,
    functionName: 'symbol',
    query: {
      enabled: !isEth && !isPuff && !!tokenAddress,
    }
  });

  return (
    <span>
      {isEth ? 'ETH' : (isPuff ? 'PUFF' : (symbol || `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`))}
    </span>
  );
}
