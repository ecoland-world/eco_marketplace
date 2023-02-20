import { Database } from "@tableland/sdk";
import { ethers } from "hardhat";

const main = async () => {

const provider = new ethers.providers.AlchemyProvider("maticmum", process.env.MUMBAI_ALCHEMY_KEY);
const db = Database.readOnly("maticmum"); // Polygon Mumbai testnet

const tableName = "place_the_table_name_here"

const { results }: any = await db.prepare(`SELECT * FROM ${tableName};`).all();
console.log(results);

};

main().catch((error) => {
console.error(error);
process.exit(1);
});
