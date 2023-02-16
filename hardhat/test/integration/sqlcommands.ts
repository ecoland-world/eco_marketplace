import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { TablelandTables } from "../../typechain-types";
import { Database } from "@tableland/sdk";

const tableName = "eco_mkt_31337_1"; // Our pre-defined health check table

const db = Database.readOnly("local-tableland"); // Polygon Mumbai testnet



chai.use(chaiAsPromised);
const expect = chai.expect;

describe("TablelandTables", function () {
  let accounts: SignerWithAddress[];
  let tables: TablelandTables;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TablelandTables");
    tables = (await Factory.deploy()) as TablelandTables;
    await tables.deployed();
    await (await tables.initialize("https://foo.xyz/")).wait();
  });

  it("Should not be initializable more than once", async function () {
    await expect(tables.initialize("https://foo.xyz/")).to.be.revertedWith(
      "ERC721A__Initializable: contract is already initialized"
    );
  });

  it("Should have set owner to deployer address", async function () {
    const owner = await tables.owner();
    expect(owner).to.equal(accounts[0].address);
  });

  it("Should create a new table", async function () {
    // Test anyone can create a table
    const owner = accounts[4];
    const createStatement = "create table testing (int a);";
    let tx = await tables
      .connect(owner)
      .createTable(owner.address, createStatement);
    let receipt = await tx.wait();
    let [mintEvent, createEvent] = receipt.events ?? [];
    expect(mintEvent.args!.tokenId).to.equal(BigNumber.from(1));
    expect(createEvent.args!.tableId).to.equal(BigNumber.from(1));
    expect(createEvent.args!.owner).to.equal(owner.address);
    expect(createEvent.args!.statement).to.equal(createStatement);
    let balance = await tables.balanceOf(owner.address);
    expect(balance).to.equal(BigNumber.from(1));
    let totalSupply = await tables.totalSupply();
    expect(totalSupply).to.equal(BigNumber.from(1));

    // Test an account can create a table for another account
    const sender = accounts[5];
    tx = await tables
      .connect(sender)
      .createTable(owner.address, createStatement);
    receipt = await tx.wait();
    [mintEvent, createEvent] = receipt.events ?? [];
    expect(mintEvent.args!.tokenId).to.equal(BigNumber.from(2));
    expect(createEvent.args!.tableId).to.equal(BigNumber.from(2));
    expect(createEvent.args!.owner).to.equal(owner.address);
    expect(createEvent.args!.statement).to.equal(createStatement);
    balance = await tables.balanceOf(owner.address);
    expect(balance).to.equal(BigNumber.from(2));
    totalSupply = await tables.totalSupply();
    expect(totalSupply).to.equal(BigNumber.from(2));
  });

  it("Should be able to run SQL", async function () {
    // Test run SQL fails if table does not exist
    const owner = accounts[4];
    const runStatement = "insert into testing values (0);";
    await expect(
      tables
        .connect(owner)
        .runSQL(owner.address, BigNumber.from(1), runStatement)
    ).to.be.revertedWithCustomError(tables, "Unauthorized");

    const createStatement = "create table testing (int a);";
    let tx = await tables
      .connect(owner)
      .createTable(owner.address, createStatement);
    let receipt = await tx.wait();
    const [, createEvent] = receipt.events ?? [];
    const tableId = createEvent.args!.tableId;

    // Test owner can run SQL on table
    tx = await tables
      .connect(owner)
      .runSQL(owner.address, tableId, runStatement);
    receipt = await tx.wait();
    let [runEvent] = receipt.events ?? [];
    expect(runEvent.args!.caller).to.equal(owner.address);
    expect(runEvent.args!.isOwner).to.equal(true);
    expect(runEvent.args!.tableId).to.equal(tableId);
    expect(runEvent.args!.statement).to.equal(runStatement);
    expect(runEvent.args!.policy).to.not.equal(undefined);

    // Test others can run SQL on table
    const nonOwner = accounts[5];
    tx = await tables
      .connect(nonOwner)
      .runSQL(nonOwner.address, tableId, runStatement);
    receipt = await tx.wait();
    [runEvent] = receipt.events ?? [];
    expect(runEvent.args!.caller).to.equal(nonOwner.address);
    expect(runEvent.args!.isOwner).to.equal(false);
    expect(runEvent.args!.tableId).to.equal(tableId);
    expect(runEvent.args!.statement).to.equal(runStatement);
    expect(runEvent.args!.policy).to.not.equal(undefined);

    // Test others cannot run SQL on behalf of another account
    const sender = accounts[5];
    const caller = accounts[6];
    await expect(
      tables.connect(sender).runSQL(caller.address, tableId, runStatement)
    ).to.be.revertedWithCustomError(tables, "Unauthorized");

    // Test contract owner can run SQL on behalf of another account
    const contractOwner = accounts[0];
    tx = await tables
      .connect(contractOwner)
      .runSQL(caller.address, tableId, runStatement);
    receipt = await tx.wait();
    [runEvent] = receipt.events ?? [];
    expect(runEvent.args!.caller).to.equal(caller.address);
    expect(runEvent.args!.isOwner).to.equal(false);
    expect(runEvent.args!.tableId).to.equal(tableId);
    expect(runEvent.args!.statement).to.equal(runStatement);
    expect(runEvent.args!.policy).to.not.equal(undefined);
  });

  it("Should emit transfer event when table transferred", async function () {
    const owner = accounts[4];
    const createStatement = "create table testing (int a);";
    let tx = await tables
      .connect(owner)
      .createTable(owner.address, createStatement);
    let receipt = await tx.wait();
    const [, createEvent] = receipt.events ?? [];
    const tableId = createEvent.args!.tableId;

    // Test events from creating table do not include transfer event
    // (should be one from mint event and one custom create table event)
    expect(receipt.events?.length).to.equal(2);

    // Test owner transferring table
    const newOwner = accounts[5];
    tx = await tables
      .connect(owner)
      .transferFrom(owner.address, newOwner.address, tableId);
    receipt = await tx.wait();
    const [, transferTableEvent] = receipt.events ?? [];
    expect(transferTableEvent.args!.from).to.equal(owner.address);
    expect(transferTableEvent.args!.to).to.equal(newOwner.address);
    expect(transferTableEvent.args!.tableId).to.equal(
      createEvent.args!.tableId
    );
  });

  it("Should udpate the base URI", async function () {
    // Test only contact owner can set base URI
    const owner = accounts[4];
    await expect(
      tables.connect(owner).setBaseURI("https://fake.com/")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const contractOwner = accounts[0];
    let tx = await tables
      .connect(contractOwner)
      .setBaseURI("https://fake.com/");
    await tx.wait();

    tx = await tables
      .connect(owner)
      .createTable(owner.address, "create table testing (int a);");
    await tx.wait();
    const tokenURI = await tables.tokenURI(1);
    expect(tokenURI).includes("https://fake.com/");
  });

  it("Should pause and unpause minting", async function () {
    const owner = accounts[4];
    const createStatement = "create table testing (int a);";
    let tx = await tables
      .connect(owner)
      .createTable(owner.address, createStatement);
    await tx.wait();

    // Test only contract owner can pause
    expect(tables.connect(owner).pause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    // Pause with contract owner
    const contractOwner = accounts[0];
    tx = await tables.connect(contractOwner).pause();
    await tx.wait();

    // Test creating tables is paused
    await expect(
      tables.connect(owner).createTable(owner.address, createStatement)
    ).to.be.revertedWith("Pausable: paused");

    // Test running SQL is paused
    await expect(
      tables
        .connect(owner)
        .runSQL(
          owner.address,
          BigNumber.from(1),
          "insert into testing values (0);"
        )
    ).to.be.revertedWith("Pausable: paused");

    // Test setting controller is paused
    await expect(
      tables
        .connect(owner)
        .setController(owner.address, BigNumber.from(1), accounts[5].address)
    ).to.be.revertedWith("Pausable: paused");

    // Test locking controller is paused
    await expect(
      tables.connect(owner).lockController(owner.address, BigNumber.from(1))
    ).to.be.revertedWith("Pausable: paused");

    // Test only contract owner can unpause
    await expect(tables.connect(owner).unpause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    // Unpause with contract owner
    tx = await tables.connect(contractOwner).unpause();
    await tx.wait();

    // Test creating tables is unpaused
    tx = await tables
      .connect(owner)
      .createTable(owner.address, createStatement);
    await tx.wait();
  });
/*
  it("Should reject big statements when running SQL", async function () {
    const owner = accounts[4];
    const createStatement = "create table testing (int a);";
    const tx = await tables
      .connect(owner)
      .createTable(owner.address, createStatement);
    const receipt = await tx.wait();
    const [, createEvent] = receipt.events ?? [];
    const tableId = createEvent.args!.tableId;

    // Creating a fake statement greater than 35000 bytes
    const runStatement = Array(35001).fill("a").join("");

    await expect(
      tables.connect(owner).runSQL(owner.address, tableId, runStatement)
    ).to.be.revertedWithCustomError(tables, "MaxQuerySizeExceeded");
  });
*/
  it("Should be able to get tableId inside a contract", async function () {
    const Factory = await ethers.getContractFactory("TestCreateFromContract");
    // supply the address of the registry contract
    const contract = await Factory.deploy(tables.address);
    await contract.deployed();
    const createTx = await contract.create("test_table");
    await createTx.wait();
    const tableId = await contract.tables("test_table");

    expect(tableId instanceof BigNumber).to.equal(true);
    expect(tableId.toNumber()).to.equal(1);
  });

  describe("Marketplace SQL Commands", function () {
    let accounts: SignerWithAddress[];
    let ngoAddress: string;
    let ecoMarketAddress: string;
    let ecoMarketDeploy: Contract;
    let ecoMarketDeploy2: Contract;
    let erc1155Contract: Contract;
    let erc721Contract: Contract;
    
    before(async () => {
       
        accounts = await ethers.getSigners();
        ngoAddress = accounts[1].address;
        
    });

    beforeEach(async function () {

        const EcoMarket = await ethers.getContractFactory("EcoMarketPlace");
        
        ecoMarketDeploy = await EcoMarket.connect(accounts[2]).deploy(ngoAddress, ethers.utils.parseEther("0.05"), "1.0.0", tables.address);
        await ecoMarketDeploy.deployed();
        ecoMarketAddress = ecoMarketDeploy.address;
        //console.log("EcoMarket deployed to:", ecoMarketAddress);
        const ERC1155 = await ethers.getContractFactory("ERC1155Mock");
        const ERC721 = await ethers.getContractFactory("ERC721Mock");
        const erc1155Deploy = await ERC1155.connect(accounts[2]).deploy();
        await erc1155Deploy.deployed();
        erc1155Contract = erc1155Deploy;
        const erc721Deploy = await ERC721.connect(accounts[2]).deploy();
        await erc721Deploy.deployed();
        erc721Contract = erc721Deploy;

        ecoMarketDeploy2 = await EcoMarket.connect(accounts[2]).deploy(ngoAddress, ethers.utils.parseEther("0.05"), "1.0.0", tables.address);
        await ecoMarketDeploy2.deployed();

    });
  

    it("Should be able to create a table with EcoMarketplace", async function () {
         // the constructor of EcoMarketPlace will create a table  for sales and receipts
        const tableId = await ecoMarketDeploy.getSAndRTableId();
        expect (tableId).to.equal(1);
        //await tables.setController(accounts[2].address, tableId, ecoMarketAddress);
        expect (await tables.ownerOf(tableId)).to.equal(ecoMarketAddress);
        
        const tableId2 = await ecoMarketDeploy2.getSAndRTableId();
        //expect (tableId2).to.equal(2);
        expect (await tables.ownerOf(tableId2)).to.equal(ecoMarketDeploy2.address);
            
        });
  

    it("Should be able to create a table row upon sale creation", async function () {
        await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
        await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
        const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
        expect(isApproved).to.equal(true);
        const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
        const receipt = await tx.wait();
        

        const row = await tables.runSQL(ecoMarketAddress, 1, "select * from sales where id = 1;");
        

    	});

    it("Should be able to create a table row upon receipt creation", async function () {
/*
        await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
        await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
        const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
        expect(isApproved).to.equal(true);
        const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
        const receipt = await tx.wait();
        const tx2 = await ecoMarketDeploy.connect(accounts[1]).buySale(1);
        const receipt2 = await tx2.wait();

        const row = await tables.runSQL(ecoMarketAddress, 1, "select * from receipts where id = 1;");
*/      

    	});

    it("Should be able to update a table row upon sale update", async function () {

      });

    it ("Should be able to update the bids table upon bid creation", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();
          
          const tx2 = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, 1, {value: ethers.utils.parseEther('0.09')});
          const receipt2 = await tx2.wait();
          const row = await tables.runSQL(ecoMarketAddress, 1, "select * from bids where id = 1;");
          
          
      
      
        });  
    });
});