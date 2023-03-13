import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import {
  useContract,
  useNetwork,
  useNetworkMismatch,
  useContractWrite,
  Web3Button
} from '@thirdweb-dev/react';

import { ethers } from "ethers";


import { useRouter } from 'next/router';

import matic from '../../public/images/polygon-matic-logo.png';
import Image from 'next/image';
import Link from 'next/link';
import CountdownTimer from '../../components/CountdownTimer';

function useQuery() {
  const router = useRouter();
  const hasQueryParams =
    /\[.+\]/.test(router.route) || /\?./.test(router.asPath);
  const ready = !hasQueryParams || Object.keys(router.query).length > 0;
  if (!ready) return null;
  return router.query;
}

const ListingPage: NextPage = () => {
  const contractAddress = "0x65DF5017C0EbC026dcccAE20dd7D3Cd751168d0C";
  const { contract } = useContract(contractAddress);
  const { mutateAsync, isLoading, error } = useContractWrite(
    contract,
    "buy",
  );
  
  const [listingId, setListingId]: any = useState();

  // In your components (instead of useRouter)
  const query = useQuery();

  const [listing, setListing] = useState();

  

  const [sale, setSale]: any = useState([]);
  const [ready, setReady] = useState(false);
  const [shortenedSeller, setShortenedSeller] = useState('');
let price;

 
  
  useEffect(() => {
    if (!query) {
      return;
    }
    async function fetchSales() {
      const response: any = await fetch('/api/orders');
      
      //console.log({router})
      let res = await response.json();
      
      setSale(res.results[parseInt(query.listingId as string) - 1])
      //setShortenedSeller(shortenAddress(sale.seller))
	
    
    }
    fetchSales();
    
    
    }, [query]);

    setTimeout(function(){
      price = (sale.price * 1.06)
      setReady(true)


}, 2000)

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
      
      {!ready ? (
        <div>Loading listings...</div>
      ) : (
        <div>
      <div className='flex flex-col md:flex-row'>
        <div className='md:w-1/2'>
          <img
            className='w-full h-auto rounded-lg shadow-lg border'
            src= "https://ipfs.io/ipfs/bafybeihfchpuczufxi4j33zielnsnqkswwzdbbfquaegq2t3tpawdt3lgy"
            alt='NFT Image'
          />
        </div>
        <div className='md:w-1/2 md:pl-8'>
          <h1 className='text-3xl font-medium text-gray-900 mb-2'>
            Sale #{sale.id}
          </h1>
          <p className='text-gray-600 mb-4'>NFT Sale</p>
          <h2 className='text-xl flex space-x-1 items-center'>
            <div>Owner:</div>
            <Image
              className='w-8 h-8 rounded-full mr-2 bg-slate-300'
              src={`https://api.dicebear.com/5.x/miniavs/png?seed=${sale.seller}`}
              alt='avatar'
              width={100}
              height={100}
            />
            <Link
              href={`../profile/${sale.seller}`}
              className='hover:text-green-600 hover:cursor-pointer'
            >
              {sale.seller}
            </Link>
          </h2>
          <div className='flex items-center justify-between mb-4 mt-4'>
            <span className='text-gray-700 text-xl font-medium flex space-x-1 items-center'>
              <span>
                Price: {sale.price/10**18}{' '}
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
            <Web3Button
              contractAddress={contractAddress}
            // Calls the "setName" function on your smart contract with "My Name" as the first argument
            action={() => mutateAsync([sale.tokenContract, sale.seller, sale.id,
	{
            gasLimit: 1000000, // override default gas limit
            value: (price.toString()) , // send 0.1 ether with the contract call
          },
])}
           >
        Buy Now
      </Web3Button>
            
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
      )}
    </div>
  );
};


export default ListingPage;
