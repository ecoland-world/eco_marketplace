import React from 'react';
import Link from 'next/link';
import {
  useActiveListings,
  useContract,
  MediaRenderer,
  useEnglishAuctions,
} from '@thirdweb-dev/react';
import NFTCard from '../components/NFTCard';
import { BigNumber } from 'ethers';

const Auction = () => {
  // marketplace contract
  const { contract: marketplace } = useContract(
    '0x3632b6971FAf78D32eD0e14C455CBC6882ced7F7',
    'marketplace'
  );

  const { data: auctions, isLoading: loadingListings } =
    useActiveListings(marketplace);

  console.log(auctions);
  return (
    <div className='flex items-center justify-center min-h-screen'>
      {loadingListings ? (
        <div>Loading autcions...</div>
      ) : (
        <div className='grid grid-cols-4 gap-4 justify-center items-center'>
          {/* Auctions */}
          {auctions
            ?.filter((auction) => auction.type == 1)
            .map((auction) => (
              <Link href={`/auction/${auction.id}`} key={auction.id}>
                <NFTCard
                  nft={{
                    name: auction.asset.name as string,
                    tokenUri: auction.asset.image as string,
                    price: auction.buyoutCurrencyValuePerToken?.displayValue,
                    seller: auction.sellerAddress as string,
                    id: auction.id as string,
                    description: auction.asset.description as string,
                  }}
                />
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default Auction;
