import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useSWR, { Fetcher } from 'swr';
import { useContract, useNFTs, useOwnedNFTs } from '@thirdweb-dev/react';

const Profile = () => {
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

  return (
    <div className='min-h-screen flex flex-col w-full space-y-10'>
      <div className='flex justify-evenly w-full'>
        <div className='flex flex-col items-center'>
          <p>{'🖼️'}Owned NFTs</p>
          <p>0</p>
        </div>
        <div className='flex flex-col items-center'>
          <p>{'💰'}Total Value</p>
          <p>0</p>
        </div>
        <div className='flex flex-col items-center'>
          <p>{'💸'}Donated</p>
          <p>0</p>
        </div>
        <div className='flex flex-col items-center'>
          <p>{'🌿'}Carbon Credits</p>
          <p>0</p>
        </div>
        <div className='flex flex-col items-center'>
          <p>{'⚡'}Energy Credits</p>
          <p>0</p>
        </div>
      </div>
      <div className='w-full flex flex-col items-center'>
        <p>My NFTs</p>
      </div>
    </div>
  );
};

export default Profile;
