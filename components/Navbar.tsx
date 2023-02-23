import React, { useState } from 'react';
import { ConnectWallet, useAddress } from '@thirdweb-dev/react';
import Link from 'next/link';
import { NextPage } from 'next';

const Navbar: NextPage = () => {
  const address = useAddress();

  return (
    <nav className='py-4 px-[120px] drop-shadow-md'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-16'>
          <Link href={'/'}>
            <h1 className='text-2xl font-bold'>
              <span>🌿</span> ECO MARKET
            </h1>
          </Link>

          <div>
            <ul className='flex items-center justify-center space-x-6'>
              <li>
                <Link href='/marketplace'>Marketplace</Link>
              </li>
              <li>
                <Link href='/auction'>Auction</Link>
              </li>
              <li>
                <Link href={`profile/${address}`}>Profile</Link>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <ConnectWallet accentColor='#2E8B57' colorMode='light' />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
