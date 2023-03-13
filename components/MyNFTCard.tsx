import Image from 'next/image';
import { MediaRenderer } from '@thirdweb-dev/react';
import matic from '../public/images/polygon-matic-logo.png';

function shortenAddress(address: string, chars = 4) {
  const prefix = address.substring(0, chars);
  const suffix = address.substring(address.length - chars);
  return `${prefix}...${suffix}`;
}

const MyNFTCard = ({
  nft,
}: {
  nft: {
    tokenUri: string;
    name: string;
    description: string;
  };
}) => {
  return (
    <div className='bg-white w-auto rounded-lg shadow-lg border overflow-hidden flex flex-col items-center'>
      <div className='p-2'>
        <MediaRenderer
          src={nft.tokenUri}
          style={{ objectFit: 'contain' }}
          className='rounded-lg'
        />
      </div>

      <div className='p-4 text-center'>
        <h2 className='text-lg font-medium text-gray-800 mb-2'>{nft.name}</h2>
        <p className='text-gray-600'>{nft.description}</p>
        {/* <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center'>
            <Image
              className='w-8 h-8 rounded-full mr-2 bg-slate-300'
              src={`https://api.dicebear.com/5.x/miniavs/png?seed=${nft.seller}`}
              alt='avatar'
              width={100}
              height={100}
            />
            <span className='text-gray-700 text-sm font-medium'>
              {shortenAddress(nft.seller as string)}
            </span>
          </div>
          <div className='flex items-center space-x-1'>
            <p className='text-gray-600 text-lg'>{nft.price}</p>
            <Image src={matic} height={20} width={20} alt={''} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MyNFTCard;
