import { TransactionInterface } from '@/types/transaction-types';
import { ethers } from 'ethers';

import { useEffect, useState } from 'react';
import { getNftTransactions } from '@/api/nft';


export default function Nft_Transaction({ nftId }: { nftId: string }) {
    const [transactions, setTransactions] = useState<TransactionInterface[] | null>(null);
    // console.log(nftId)
    useEffect(() => {
        const fetchData = async () => {
            const result = await getNftTransactions(nftId);
            setTransactions(result.transactions as TransactionInterface[]);
            // console.log(result);
        }
        fetchData()
    }, [])
    return (
        <div>
            <h1>Transactions</h1>
            <table>

                <thead>
                    <tr>

                        <th>TxHash</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
                    {transactions?.map((tran) => {
                        return (

                            <tr className='bg-pink-600 m-2' key={tran.id}>
                                <td>{tran.transactionHash.slice(0, 6)}...| </td>
                                <td>{tran.seller.address.slice(0, 6)}...|</td>
                                <td> {tran.buyer.address.slice(0, 6)}...| </td>
                                <td>{tran.price}| </td>
                            </tr>
                        )
                    })}
                </tbody>

            </table>

        </div>
    )
}
