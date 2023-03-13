// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from "@tableland/sdk";
import { ethers } from "ethers";



export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const provider = new ethers.providers.AlchemyProvider("maticmum", process.env.MUMBAI_ALCHEMY_KEY);
  const db = Database.readOnly("maticmum"); // Polygon Mumbai testnet

  const tableName = "eco_mkt_80001_5797"
  let response: any= {}

    async function initialLoad(){
      response = await db.prepare(`SELECT * FROM ${tableName};`).all();
      console.log({response})
      console.log(response.results)
      res.status(200).json(response)
    }
    initialLoad();
    
  //res.status(200).json(results)
}
