import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useContract, useNFTs, useOwnedNFTs } from '@thirdweb-dev/react';
import MyNFTCard from '../../components/MyNFTCard';

const Profile = () => {
  const [owned, setOwned] = useState('0');
  const [totalValue, setTotalValue] = useState('0');
  const [donated, setDonated] = useState('0');
  const [carbonCredits, setCarbonCredits] = useState('0');
  const [energyCredits, setEnergyCredits] = useState('0');

  const router = useRouter();

  const { walletAddress } = router.query;

  const { contract } = useContract(
    '0x4cFfcac1c63f366D183Ae465FE5Fd1dC26126dc5'
  );
  const {
    data: ownedNFTs,
    isLoading,
    error,
  } = useOwnedNFTs(contract, walletAddress as string);

  console.log(ownedNFTs);

  if (!ownedNFTs)
    return (
      <div className='flex items-center justify-center'>   Loading ...   </div>
    );

  return (
    <div className='min-h-screen flex flex-col w-full space-y-10 items-center mt-6'>
      <div className='bg-gray-200 max-w-7xl w-full flex flex-col space-y-5 pt-8 pb-8'>
        <div className='flex flex-col space-y-2 items-center justify-center'>
          <Image
            className='w-20 h-20 rounded-full mr-2 bg-white'
            src={`https://api.dicebear.com/5.x/miniavs/png?seed=${walletAddress}`}
            alt='avatar'
            width={100}
            height={100}
          />
          <p className='font-bold text-lg'>{walletAddress}</p>
        </div>
        <div>
          <div className='flex justify-evenly w-full text-lg'>
            <div className='flex flex-col items-center'>
              <p>{'🖼️'}Owned NFTs</p>
              <p>{owned}</p>
            </div>
            <div className='flex flex-col items-center'>
              <p>{'💰'}Total Value</p>
              <p>{totalValue}</p>
            </div>
            <div className='flex flex-col items-center'>
              <p>{'💸'}Donated</p>
              <p>{donated}</p>
            </div>
            <div className='flex flex-col items-center'>
              <p>{'🌿'}Carbon Credits</p>
              <p>{carbonCredits}</p>
            </div>
            <div className='flex flex-col items-center'>
              <p>{'⚡'}Energy Credits</p>
              <p>{energyCredits}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full flex flex-col items-center max-w-7xl'>
        <p className='text-lg'>My NFTs</p>
        {ownedNFTs?.length === 0 ? (
          <div>No NFTs were found...</div>
        ) : (
          <div className='w-full grid grid-cols-4 gap-4 mt-4'>
            {ownedNFTs.map((owned) => {
              return (
                <div key={owned.metadata.id}>
                  <MyNFTCard
                    nft={{
                      name: owned.metadata.name as string,
                      tokenUri: owned.metadata.image as string,
                      description: owned.metadata.description as string,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
