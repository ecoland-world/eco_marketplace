import React from 'react';

const test = () => {
  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
      <img
        className='w-full h-56 object-cover'
        src='https://placehold.it/500x500'
        alt='NFT Image'
      />
      <div className='p-4'>
        <h2 className='text-lg font-medium text-gray-800 mb-2'>NFT Title</h2>
        <p className='text-gray-600'>NFT Description</p>
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center'>
            <img
              className='w-8 h-8 rounded-full mr-2'
              src='https://placehold.it/100x100'
              alt='User Avatar'
            />
            <span className='text-gray-700 text-sm font-medium'>Username</span>
          </div>
          <span className='text-gray-600 text-sm'>Price: 1 ETH</span>
        </div>
      </div>
    </div>
  );
};

export default test;
