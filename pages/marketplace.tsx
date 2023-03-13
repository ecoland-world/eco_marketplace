import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useActiveListings,
  useContract,
  MediaRenderer,
  useEnglishAuctions,
} from '@thirdweb-dev/react';
import NFTCard from '../components/NFTCard';

const Marketplace = () => {

  const [sales, setSales]: any = useState({});
  const [ready, setReady] = useState(false);

 
  
  useEffect(() => {
    async function fetchSales() {
      const response: any = await fetch('/api/orders');
      let res = await response.json();
      console.log(res.results)

    setSales(res.results)
    setReady(true)
    setTimeout(function(){console.log({sales})}, 1000)
    }
    fetchSales();
    
    
    }, []);
    // get all sales and receipts

  
  // marketplace contract
    
  const { contract: marketplace } = useContract(
    '0x65DF5017C0EbC026dcccAE20dd7D3Cd751168d0C',
    'marketplace'
  );

  const { data: listings, isLoading: loadingListings } =
    useActiveListings(marketplace);

  console.log(listings);

  /*
  <a>{sale.amount}</a>
                <a>{sale.buyer}</a>
                <a>{sale.price}</a>
                <a>{sale.id}</a>
                <a>{sale.nftId}</a>
                <a>{sale.receipt}</a>
                <a>{sale.seller}</a>
                <a>{sale.timestamp}</a>
                <a>{sale.tokenContract}</a>
  */

  return (
    <div className='flex items-center justify-center min-h-screen'>
      {!ready ? (
        <div>Loading listings...</div>
      ) : (
        <div className='grid grid-cols-4 gap-4 justify-center items-center'>
          {
            sales.map((sale: any) => (
			!sale.buyer &&
              <>
                <Link href={`/listing/${sale.id}`} key={sale.id}>
                <NFTCard
                  nft={{
                    name: "Sale #" + sale.id,
                    price: sale.price / 10**18,
                    seller: sale.seller,
                    id: sale.id,
                    tokenUri: "https://ipfs.io/ipfs/bafybeihfchpuczufxi4j33zielnsnqkswwzdbbfquaegq2t3tpawdt3lgy",
                    description: "NFT sale",

                    
                  }}
                />
              </Link>
              </>
            ))
          }
          {/* filter sales */}
          {listings
            ?.filter((listing) => listing.type == 0)
            .map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id}>
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
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
