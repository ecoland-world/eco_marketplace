import React from 'react';
import Link from 'next/link';
import {
  useActiveListings,
  useContract,
  MediaRenderer,
} from '@thirdweb-dev/react';
import { useRouter } from 'next/router';

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
      {
        // load listings
        loadingListings ? (
          <div>Loading listings...</div>
        ) : (
          // show listings
          <div className='flex items-center justify-center'>
            {listings?.map((listing) => (
              <div
                key={listing.id}
                onClick={() => router.push(`/listing/${listing.id}`)}
                className='flex flex-col items-center'
              >
                <MediaRenderer src={listing.asset.image} />
                <h2>
                  <Link href={`/listing/${listing.id}`}>
                    {listing.asset.name}
                  </Link>
                </h2>

                <p>
                  <b>{listing.buyoutCurrencyValuePerToken.displayValue}</b>{' '}
                  {listing.buyoutCurrencyValuePerToken.symbol}
                </p>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

export default Marketplace;
