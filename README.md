
## Video Overview

https://www.youtube.com/watch?v=1OdYKpN_H7M

## Summary
Ecoland - an eco-friendly game with social and environmental impact. Where players will be saving the environment by simply playing games.

### Problems in Web3 Games:
- Blockchain effects
    - Blockchain has a negative impact on ecology as energy consumption contributes to greenhouse gas emissions and contributes to climate change. Data centers used to host Web3 games and other blockchain-based applications can have a large carbon footprint due to the energy consumption of their servers and cooling systems
- User Experience
    - Web3 games are a relatively new and rapidly evolving technology, and there is currently a lack of standardization in terms of development tools, platforms, and graphics APIs.
- Game Economy
    - Overall, the lack of a sustainable economy in Web3 games is a result of a combination of technical, regulatory, and adoption-related challenges, which will likely take time to overcome as the technology and ecosystem continue to mature.


### Solution:

- Game with Real-life impact
    - **20%** of all transactions will be donated directly through Smart Contract to NGOs which helping to make our environment more sustainable
- Planting Trees
    - Our first goal is to plant **1 million trees**. The Ecoland team alongside partner NGOs will start this initiative and all players can contribute as well
- Trust/Credibility in NGOs
    - Providing a secure and transparent platform for tracking and accounting for donations. This will increase public trust and confidence in the organization, and demonstrate its commitment to operating in a responsible and accountable manner

## Our Project For Pilot Program

The **Eco-Marke**t is a part of the Ecoland game, where all players can buy/sell/exchange game assets and NFTs, which they can use in-game.

As players buy assets they are directly making donations and thus helping the environment. In return, players are receiving NFT certificates, as proof that they actually helped to restore the environment. Then we will be calculating carbon credits and rewarding it to players as well. We look forward to working with the Toucan team on our mission to make our environment more sustainable.

### Main functionalities

- Sale orders creation
- Purchase orders
- Bidding
- Sales canceling
- Bids canceling
- Administrative functions
    - Fee settings
    - NGO settings
    - Admin withdraws
    - NGO Withdraws

The usage of the SQL tables will enable EcoMarket to directly index sales, bids, and receipts upon smart contract function calls. This will also enable server-side rendering for filtered/sorted queries without developing another solution to provide this (such as event listeners and indexers) at our Next.js dApp.

It seems that the layer of complexity involved in creating server-side applications with the intent of indexing transactions in databases with little-to-no downtime has been removed altogether. The SQL table commands placed into the smart contract itself ensure any relevant operation is placed correctly in tables otherwise the transaction fails. We are quite fond of this feature as this means one less important feature to monitor and maintain once in production.

## Tech Stack

![eco_market_techStack.png](https://file.notion.so/f/s/7f3c23bc-0d37-48e4-9487-fe2836752635/eco_market_techStack.png?spaceId=5cd78e1f-33eb-40f8-ba21-42b02db5f279&table=block&id=8fd7ffd8-464a-4390-9148-1285beccc0cb&expirationTimestamp=1679927816714&signature=7Ks6exgSUHwTkIzh4oFiy-VF6LhKHfqUwSmrSdi6IC4&downloadName=eco_market_techStack.png)

## Diagrams

[https://docs.google.com/presentation/d/1Urbngj8cSH-YTAylRN1dzlNyONZcqtF5-bn5Bxc5CvQ/edit?usp=sharing](https://docs.google.com/presentation/d/1Urbngj8cSH-YTAylRN1dzlNyONZcqtF5-bn5Bxc5CvQ/edit?usp=sharing)


## Figma wireframe of Eco-Marketplace

https://www.figma.com/file/6mqTkinL2rOn2VxeTvinre?embed_host=notion&kind=&node-id=42%3A949&t=hN0N7AaPoW4v6fai-1&viewer=1
