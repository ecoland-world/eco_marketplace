import React from "react";

const test = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img
            className="w-full h-auto rounded-lg shadow-lg"
            src="https://placehold.it/500x500"
            alt="NFT Image"
          />
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">NFT Title</h1>
          <p className="text-gray-600 mb-4">NFT Description</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 text-xl font-medium">
              Price: 1 ETH
            </span>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Buy Now
            </button>
          </div>
          <form>
            <div className="flex items-center mb-4">
              <label for="bidAmount" className="text-gray-700 mr-4">
                Bid Amount:
              </label>
              <input
                id="bidAmount"
                name="bidAmount"
                type="number"
                min="0"
                step="0.001"
                className="w-1/2 py-2 px-3 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="ml-2 text-gray-500">ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-xl font-medium">
                Current Highest Bid: 0.8 ETH
              </span>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Place Bid
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="my-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">
          Action History
        </h2>
        <ul className="border rounded-lg overflow-hidden">
          <li className="border-b px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  className="w-8 h-8 rounded-full mr-2"
                  src="https://placehold.it/100x100"
                  alt="User Avatar"
                />
                <span className="text-gray-700 text-sm font-medium">
                  Username
                </span>
              </div>
              <span className="text-gray-600 text-sm">Bought for 1 ETH</span>
            </div>
          </li>
          <li className="border-b px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  className="w-8 h-8 rounded-full mr-2"
                  src="https://placehold.it/100x100"
                  alt="User Avatar"
                />
                <span className="text-gray-700 text-sm font-medium">
                  Username
                </span>
              </div>
              <span className="text-gray-600 text-sm">
                Placed a bid of 0.8 ETH
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    // <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    //   <img
    //     className="w-full h-56 object-cover"
    //     src="https://placehold.it/500x500"
    //     alt="NFT Image"
    //   />
    //   <div className="p-4">
    //     <h2 className="text-lg font-medium text-gray-800 mb-2">NFT Title</h2>
    //     <p className="text-gray-600">NFT Description</p>
    //     <div className="flex items-center justify-between mt-4">
    //       <div className="flex items-center">
    //         <img
    //           className="w-8 h-8 rounded-full mr-2"
    //           src="https://placehold.it/100x100"
    //           alt="User Avatar"
    //         />
    //         <span className="text-gray-700 text-sm font-medium">Username</span>
    //       </div>
    //       <span className="text-gray-600 text-sm">Price: 1 ETH</span>
    //     </div>
    //     <div className="mt-6">
    //       <div className="flex items-center justify-between">
    //         <span className="text-gray-600 text-sm">Current Bid:</span>
    //         <span className="text-gray-700 font-medium text-lg">2 ETH</span>
    //       </div>
    //       <div className="mt-4">
    //         <form className="flex flex-col">
    //           <label for="bid-amount" className="text-gray-600 text-sm">
    //             Place a Bid:
    //           </label>
    //           <div className="flex items-center">
    //             <span className="text-gray-700 mr-2">ETH</span>
    //             <input
    //               id="bid-amount"
    //               type="number"
    //               className="border border-gray-400 rounded-lg py-2 px-3 w-32"
    //               placeholder="0.00"
    //               step="0.01"
    //               min="0"
    //             />
    //             <button
    //               type="submit"
    //               className="bg-gray-800 text-white rounded-lg py-2 px-4 ml-2"
    //             >
    //               Bid
    //             </button>
    //           </div>
    //         </form>
    //       </div>
    //       <div className="mt-6">
    //         <button className="bg-purple-700 text-white rounded-lg py-2 px-4">
    //           Buy Now for 10 ETH
    //         </button>
    //       </div>
    //     </div>
    //     <div className="mt-8">
    //       <h3 className="text-lg font-medium text-gray-800 mb-2">
    //         Activity History
    //       </h3>
    //       <ul className="divide-y divide-gray-300">
    //         <li className="py-2">
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center">
    //               <img
    //                 className="w-8 h-8 rounded-full mr-2"
    //                 src="https://placehold.it/100x100"
    //                 alt="User Avatar"
    //               />
    //               <span className="text-gray-700 font-medium">Username</span>
    //             </div>
    //             <span className="text-gray-600 text-sm">1 ETH</span>
    //           </div>
    //           <p className="text-gray-600 text-sm mt-1">Placed a bid</p>
    //         </li>
    //         <li className="py-2">
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center">
    //               <img
    //                 className="w-8 h-8 rounded-full mr-2"
    //                 src="https://placehold.it/100x100"
    //                 alt="User Avatar"
    //               />
    //               <span className="text-gray-700 font-medium">Username</span>
    //             </div>
    //             <span className="text-gray-600 text">asd</span>
    //           </div>
    //         </li>
    //       </ul>
    //     </div>
    //   </div>
    // </div>
  );
};

export default test;
