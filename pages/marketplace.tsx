import React from 'react';
import Link from 'next/link';
import {
  useActiveListings,
  useContract,
  MediaRenderer,
  useEnglishAuctions,
} from '@thirdweb-dev/react';
import { useRouter } from 'next/router';
import NFTCard from '../components/NFTCard';

const Marketplace = () => {
  const { contract } = useContract(
    '0x3632b6971FAf78D32eD0e14C455CBC6882ced7F7',
    'marketplace'
  );

  const { data: listings, isLoading: loadingListings } =
    useActiveListings(contract);

  console.log(listings);

  const router = useRouter();

  return (
    <div className='flex items-center justify-center min-h-screen'>
      {loadingListings ? (
        <div>Loading listings...</div>
      ) : (
        <div className='grid grid-cols-4 gap-4 justify-center items-center'>
          {/* filter sales */}
          {listings
            ?.filter((listing) => listing.type == 0)
            .map((listing) => (
              <div
                key={listing.id}
                onClick={() => router.push(`/listing/${listing.id}`)}
              >
                <NFTCard
                  nft={{
                    name: listing.asset.name as string,
                    tokenUri: listing.asset.image as string,
                    price: listing.buyoutCurrencyValuePerToken?.displayValue,
                    seller: listing.sellerAddress as string,
                    id: listing.id as string,
                    description: listing.asset.description as string,
                  }}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
