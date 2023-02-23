import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import {
  useContract,
  useNetwork,
  useNetworkMismatch,
} from '@thirdweb-dev/react';

import { ChainId, ListingType, NATIVE_TOKENS } from '@thirdweb-dev/sdk';

import { useRouter } from 'next/router';

const ListingPage: NextPage = () => {
  const router = useRouter();
  const networkMismatch = useNetworkMismatch();
  const switchNetwork = useNetwork();

  const { listingId } = router.query as { listingId: string };

  const [loadingListing, setLoadingListing] = useState(true);

  const [bidAmount, setBidAmount] = useState('');

  const [listing, setListing] = useState();

  const { contract } = useContract(
    '0x3632b6971FAf78D32eD0e14C455CBC6882ced7F7',
    'marketplace'
  );

  useEffect(() => {
    if (!listingId || !contract) {
      return;
    }

    (async () => {
      // Pass the listingId into the getListing function to get the listing with the given listingId
      const l = await contract.getListing(listingId);

      // Update state accordingly
      setLoadingListing(false);
      setListing(l);
    })();
  }, [listingId, contract]);

  if (loadingListing) {
    return <div>Loading...</div>;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  async function createBidOrOffer() {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(2);
        return;
      }

      // If the listing type is a direct listing, then we can create an offer.
      if (listing?.type === ListingType.Direct) {
        await contract?.direct.makeOffer(
          listingId, // The listingId of the listing we want to make an offer for
          1, // Quantity = 1
          NATIVE_TOKENS[ChainId.Goerli].wrapped.address, // Wrapped Ether address on Goerli
          bidAmount // The offer amount the user entered
        );
      }

      // If the listing type is an auction listing, then we can create a bid.
      if (listing?.type === ListingType.Auction) {
        await contract?.auction.makeBid(listingId, bidAmount);
      }

      alert(
        `${
          listing?.type === ListingType.Auction ? 'Bid' : 'Offer'
        } created successfully!`
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  async function buyNft() {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(2);
        return;
      }

      // Simple one-liner for buying the NFT
      await contract?.buyoutListing(listingId, 1);
      alert('NFT bought successfully!');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  return (
    <div>
      <img src={listing.asset.image} />
      <h1>{listing.asset.name}</h1>
      <p>
        <b>Description:</b> {listing.asset.description}
      </p>
      <p>
        <b>Seller:</b> {listing.sellerAddress}
      </p>
      <p>
        <b>Listing Type:</b>{' '}
        {listing.type === 0 ? 'Direct Listing' : 'Auction Listing'}
      </p>

      <p>
        <b>Buyout Price</b> {listing.buyoutCurrencyValuePerToken.displayValue}{' '}
        {listing.buyoutCurrencyValuePerToken.symbol}
      </p>

      <div>
        <div>
          <input
            type='text'
            placeholder='Enter bid amount'
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />

          <button onClick={createBidOrOffer}>Make Bid</button>
        </div>

        <button onClick={buyNft}>Buy Now</button>
      </div>
    </div>
  );
};

export default ListingPage;
