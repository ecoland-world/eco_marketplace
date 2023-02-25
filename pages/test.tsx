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
          <span className='text-gray-600 text-sm'>Owned</span>
        </div>
        <div className='mt-6'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-600 text-sm'>Price:</span>
            <span className='text-gray-700 font-medium text-lg'>2 ETH</span>
          </div>
          <div className='mt-4'>
            <form className='flex flex-col'>
              <label for='direct-sell-amount' className='text-gray-600 text-sm'>
                Put on Direct Sale:
              </label>
              <div className='flex items-center'>
                <span className='text-gray-700 mr-2'>ETH</span>
                <input
                  id='direct-sell-amount'
                  type='number'
                  className='border border-gray-400 rounded-lg py-2 px-3 w-32'
                  placeholder='0.00'
                  step='0.01'
                  min='0'
                />
                <button
                  type='submit'
                  className='bg-gray-800 text-white rounded-lg py-2 px-4 ml-2'
                >
                  Put on Sale
                </button>
              </div>
            </form>
          </div>
          <div className='mt-6'>
            <form className='flex flex-col'>
              <label
                for='auction-start-amount'
                className='text-gray-600 text-sm'
              >
                Start an Auction:
              </label>
              <div className='flex items-center'>
                <span className='text-gray-700 mr-2'>ETH</span>
                <input
                  id='auction-start-amount'
                  type='number'
                  className='border border-gray-400 rounded-lg py-2 px-3 w-32'
                  placeholder='Starting Price'
                  step='0.01'
                  min='0'
                />
              </div>
              <div className='flex items-center mt-4'>
                <label
                  for='auction-end-time'
                  className='text-gray-600 text-sm mr-2'
                >
                  Auction End Time:
                </label>
                <input
                  id='auction-end-time'
                  type='datetime-local'
                  className='border border-gray-400 rounded-lg py-2 px-3 w-64'
                  min='2023-02-24T00:00'
                  max='2030-12-31T00:00'
                />
              </div>
              <button
                type='submit'
                className='bg-purple-700 text-white rounded-lg py-2 px-4 mt-4'
              >
                Start Auction
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default test;
