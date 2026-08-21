import { useNftTransactions } from '@/hooks/useNftQueries';

export default function Nft_Transaction({ nftId }: { nftId: string }) {
    const { data } = useNftTransactions(nftId, { enabled: !!nftId });
    const transactions = data?.success ? data.transactions : null;
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
