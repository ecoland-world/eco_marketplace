import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import {
  useContract,
  useNetwork,
  useNetworkMismatch,
} from '@thirdweb-dev/react';

import { ChainId, ListingType, NATIVE_TOKENS } from '@thirdweb-dev/sdk';

import { useRouter } from 'next/router';

import matic from '../../public/images/polygon-matic-logo.png';
import Image from 'next/image';
import Link from 'next/link';
import CountdownTimer from '../../components/CountdownTimer';

const ListingPage: NextPage = () => {
  const router = useRouter();
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const { listingId } = router.query as { listingId: string };

  const [loadingListing, setLoadingListing] = useState(true);

  const [bidAmount, setBidAmount] = useState('');

  const [listing, setListing] = useState();

  const { contract: marketplace } = useContract(
    '0x3632b6971FAf78D32eD0e14C455CBC6882ced7F7',
    'marketplace'
  );

  useEffect(() => {
    if (!listingId || !marketplace) {
      return;
    }

    (async () => {
      const l = await marketplace.getListing(listingId);
      setLoadingListing(false);
      setListing(l);
    })();
  }, [listingId, marketplace]);

  if (loadingListing) {
    return <div>Loading...</div>;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  async function createBidOrOffer() {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(2);
        return;
      }

      if (listing?.type === ListingType.Direct) {
        await marketplace?.direct.makeOffer(
          listingId,
          1,
          NATIVE_TOKENS[ChainId.Mumbai].wrapped.address,
          bidAmount
        );
      }

      if (listing?.type === ListingType.Auction) {
        await marketplace?.auction.makeBid(listingId, bidAmount);
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
      await marketplace?.buyoutListing(listingId, 1);
      alert('NFT bought successfully!');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  console.log(listing);

  function shortenAddress(address: string, chars = 4) {
    const prefix = address.substring(0, chars);
    const suffix = address.substring(address.length - chars);
    return `${prefix}...${suffix}`;
  }

  function bigNumbertoDate(bignumber) {
    const unixTimestamp = parseInt(bignumber, 16);
    const dateObj = new Date(unixTimestamp * 1000);
    return dateObj.getTime();
  }

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col md:flex-row'>
        <div className='md:w-1/2'>
          <img
            className='w-full h-auto rounded-lg shadow-lg border'
            src={listing.asset.image}
            alt='NFT Image'
          />
        </div>
        <div className='md:w-1/2 md:pl-8'>
          <h1 className='text-3xl font-medium text-gray-900 mb-2'>
            {listing.asset.name}
          </h1>
          <p className='text-gray-600 mb-4'>{listing.asset.description}</p>
          <h2 className='text-xl flex space-x-1 items-center'>
            <div>Owner:</div>
            <Image
              className='w-8 h-8 rounded-full mr-2 bg-slate-300'
              src={`https://api.dicebear.com/5.x/miniavs/png?seed=${listing.sellerAddress}`}
              alt='avatar'
              width={100}
              height={100}
            />
            <Link
              href={`../profile/${listing.sellerAddress}`}
              className='hover:text-green-600 hover:cursor-pointer'
            >
              {shortenAddress(listing.sellerAddress)}
            </Link>
          </h2>
          <div className='flex items-center justify-between mb-4 mt-4'>
            <span className='text-gray-700 text-xl font-medium flex space-x-1 items-center'>
              <span>
                Price: {listing.buyoutCurrencyValuePerToken.displayValue}{' '}
              </span>
              {
                <Image
                  src={matic}
                  alt='matic'
                  className='w-6 h-6'
                  width={100}
                  height={100}
                />
              }
            </span>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              onClick={buyNft}
            >
              Buy Now
            </button>
          </div>
          {/* <form>
            <div className='flex items-center mb-4'>
              <label htmlFor='bidAmount' className='text-gray-700 mr-4'>
                Bid Amount:
              </label>
              <input
                id='bidAmount'
                name='bidAmount'
                type='number'
                min='0'
                step='0.001'
                className='w-1/2 py-2 px-3 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
              <span className='ml-2 text-gray-500'>
                {listing.buyoutCurrencyValuePerToken.symbol}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-700 text-xl font-medium flex space-x-1 items-center'>
                <span>Highest Bid: 10</span>
                {<Image src={matic} alt='matic' className='w-6 h-6' />}
              </span>
              <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                Place Bid
              </button>
            </div>
          </form> */}
        </div>
      </div>
      <div className='my-8'>
        <h2 className='text-2xl font-medium text-gray-900 mb-4'>
          Activity History
        </h2>
        <ul className='border rounded-lg overflow-hidden'>
          <li className='border-b px-4 py-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <img
                  className='w-8 h-8 rounded-full mr-2'
                  src='https://placehold.it/100x100'
                  alt='User Avatar'
                />
                <span className='text-gray-700 text-sm font-medium'>
                  Username
                </span>
              </div>
              <span className='text-gray-600 text-sm'>Bought for 1 ETH</span>
            </div>
          </li>
          <li className='border-b px-4 py-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <img
                  className='w-8 h-8 rounded-full mr-2'
                  src='https://placehold.it/100x100'
                  alt='User Avatar'
                />
                <span className='text-gray-700 text-sm font-medium'>
                  Username
                </span>
              </div>
              <span className='text-gray-600 text-sm'>
                Placed a bid of 0.8 ETH
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ListingPage;
