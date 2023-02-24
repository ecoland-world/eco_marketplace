import Image from 'next/image';
import { MediaRenderer } from '@thirdweb-dev/react';
import matic from '../public/images/polygon-matic-logo.png';

function shortenAddress(address: string, chars = 4) {
  const prefix = address.substring(0, chars);
  const suffix = address.substring(address.length - chars);
  return `${prefix}...${suffix}`;
}

export default function NFTCard({
  nft,
}: {
  nft: {
    tokenUri: string;
    name: string;
    price?: string;
    seller: string;
    id: string;
    description: string;
  };
}) {
  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
      <MediaRenderer
        src={nft.tokenUri}
        style={{ objectFit: 'cover' }}
        // className='w-full h-96'
      />

      <div className='p-4'>
        <h2 className='text-lg font-medium text-gray-800 mb-2'>{nft.name}</h2>
        <p className='text-gray-600'>{nft.description}</p>
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center'>
            <Image
              className='w-8 h-8 rounded-full mr-2'
              src={`https://api.dicebear.com/5.x/miniavs/png?seed=${nft.seller}`}
              alt='avatar'
              width={100}
              height={100}
            />
            <span className='text-gray-700 text-sm font-medium'>
              {shortenAddress(nft.seller)}
            </span>
          </div>
          <div className='flex items-center space-x-1'>
            <p className='text-gray-600 text-lg'>{nft.price}</p>
            <Image src={matic} height={20} width={20} alt={''} />
          </div>
        </div>
      </div>
    </div>
    //     <div
    //       className={`relative flex cursor-pointer
    //    flex-col overflow-hidden rounded-lg bg-white shadow-lg
    //    transition-all duration-300 hover:shadow-2xl dark:bg-[#333333]`}
    //     >
    //
    //       <MediaRenderer
    //         src={nft.tokenUri}
    //         style={{
    //           objectFit: 'cover',
    //         }}
    //         className={
    //           'h-[300px] rounded-lg transition duration-300 ease-in-out hover:scale-105'
    //         }
    //       />
    //       <div className={`flex flex-col gap-y-3 p-3`}>
    //          <div className={`text-sm font-semibold`}>{nft.name}</div>
    //         {nft.price && (
    //           <div>
    //                <div className={`text-xs font-semibold`}>Price</div>
    //
    //             <div className={`flex items-center gap-x-1`}>
    //
    //               <Image src={matic} height={16} width={16} alt={''} />
    //                   <p className={`text-base font-semibold`}>{nft.price}</p>
    //
    //             </div>
    //
    //           </div>
    //         )}
    //       </div>
    //     </div>
  );
}
