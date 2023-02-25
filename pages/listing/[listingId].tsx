import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import {
  useContract,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";

import { ChainId, ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";

import { useRouter } from "next/router";

import matic from "../../public/images/polygon-matic-logo.png";
import Image from "next/image";

const ListingPage: NextPage = () => {
  const router = useRouter();
  const networkMismatch = useNetworkMismatch();
  const switchNetwork = useNetwork();

  const { listingId } = router.query as { listingId: string };

  const [loadingListing, setLoadingListing] = useState(true);

  const [bidAmount, setBidAmount] = useState("");

  const [listing, setListing] = useState();

  const { contract } = useContract(
    "0x3632b6971FAf78D32eD0e14C455CBC6882ced7F7",
    "marketplace"
  );

  useEffect(() => {
    if (!listingId || !contract) {
      return;
    }

    (async () => {
      const l = await contract.getListing(listingId);
      setLoadingListing(false);
      setListing(l);
    })();
  }, [listingId, contract]);

  if (loadingListing) {
    return <div>Loading...</div>;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  async function createBidOrOffer() {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(2);
        return;
      }

      if (listing?.type === ListingType.Direct) {
        await contract?.direct.makeOffer(
          listingId,
          1,
          NATIVE_TOKENS[ChainId.Mumbai].wrapped.address,
          bidAmount
        );
      }

      if (listing?.type === ListingType.Auction) {
        await contract?.auction.makeBid(listingId, bidAmount);
      }

      alert(
        `${
          listing?.type === ListingType.Auction ? "Bid" : "Offer"
        } created successfully!`
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  async function buyNft() {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(2);
        return;
      }

      // Simple one-liner for buying the NFT
      await contract?.buyoutListing(listingId, 1);
      alert("NFT bought successfully!");
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  console.log(listing);

  function shortenAddress(address: string, chars = 4) {
    const prefix = address.substring(0, chars);
    const suffix = address.substring(address.length - chars);
    return `${prefix}...${suffix}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img
            className="w-full h-auto rounded-lg shadow-lg"
            src={listing.asset.image}
            alt="NFT Image"
          />
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            {listing.asset.name}
          </h1>
          <p className="text-gray-600 mb-4">{listing.asset.description}</p>
          <h2 className="text-xl flex space-x-1 items-center">
            Owner:
            <Image
              className="w-8 h-8 rounded-full mr-2"
              src={`https://api.dicebear.com/5.x/miniavs/png?seed=${listing.sellerAddress}`}
              alt="avatar"
              width={100}
              height={100}
            />
            {shortenAddress(listing.sellerAddress)}
          </h2>
          <div className="flex items-center justify-between mb-4 mt-4">
            <span className="text-gray-700 text-xl font-medium flex space-x-1">
              <span>
                Price: {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
              </span>
              {<Image src={matic} alt="matic" className="w-8 h-8" />}
            </span>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Buy Now
            </button>
          </div>
          <form>
            <div className="flex items-center mb-4">
              <label htmlFor="bidAmount" className="text-gray-700 mr-4">
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
              <span className="ml-2 text-gray-500">
                {listing.buyoutCurrencyValuePerToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-xl font-medium flex space-x-1">
                <span>Highest Bid: 10</span>
                {<Image src={matic} alt="matic" className="w-8 h-8" />}
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
          Activity History
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

    // <div>
    //   <img src={listing.asset.image} />
    //   <h1>{listing.asset.name}</h1>
    //   <p>
    //     <b>Description:</b> {listing.asset.description}
    //   </p>
    //   <p>
    //     <b>Seller:</b> {listing.sellerAddress}
    //   </p>
    //   <p>
    //     <b>Listing Type:</b>{" "}
    //     {listing.type === 0 ? "Direct Listing" : "Auction Listing"}
    //   </p>

    //   <p>
    //     <b>Buyout Price</b> {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
    //     {listing.buyoutCurrencyValuePerToken.symbol}
    //   </p>

    //   <div>
    //     <div>
    //       <input
    //         type="text"
    //         placeholder="Enter bid amount"
    //         value={bidAmount}
    //         onChange={(e) => setBidAmount(e.target.value)}
    //       />

    //       <button onClick={createBidOrOffer}>Make Bid</button>
    //     </div>

    //     <button onClick={buyNft}>Buy Now</button>
    //   </div>
    // </div>
  );
};

export default ListingPage;
