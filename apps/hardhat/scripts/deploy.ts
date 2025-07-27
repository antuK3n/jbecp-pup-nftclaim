import { ethers } from "hardhat";

async function main() {
  try {
    const [deployer] = await ethers.getSigners();

    if (!deployer) {
      throw new Error(
        "No deployer account found. Make sure you have configured your private key."
      );
    }

    const deployerAddress = await deployer.getAddress();
    console.log(`Deployer address: ${deployerAddress}`);

    console.log("Deploying JBECP NFT contract...");

    // Deploy the contract
    const JBECPNFT = await ethers.getContractFactory("JBECPPUPNFT");
    const jbecpNFT = await JBECPNFT.deploy();
    await jbecpNFT.waitForDeployment();

    const address = await jbecpNFT.getAddress();
    console.log(`JBECP NFT deployed to: ${address}`);

    // Create an event
    console.log("Creating event...");

    const eventData = {
      name: "BLOCKCELERATE 2025 NFT",
      description:
        "𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗮𝘁𝘁𝗲𝗻𝗱𝗶𝗻𝗴 𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 𝟮𝟬𝟮𝟱: 𝗧𝗵𝗶𝘀 𝗜𝘀 𝗢𝘂𝗿 𝗠𝗼𝗺𝗲𝗻𝘁𝘂𝗺! 🚀\\n\\n𝗧𝗮𝗹𝗸𝘀 · 𝗡𝗲𝘁𝘄𝗼𝗿𝗸𝗶𝗻𝗴 · 𝗕𝘂𝗶𝗹𝗱𝗲𝗿𝘀\\n🗓 𝗗𝗮𝘁𝗲: July 28, 2025\\n🕐 𝗧𝗶𝗺𝗲: 1:00 PM – 6:00 PM\\n📍 𝗩𝗲𝗻𝘂𝗲: ArthaLand Century Pacific Tower, BGC\\n\\nThere's a reason it starts with a block — solid, foundational, essential.\\nBut 𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 is about what comes next: when builders stop stacking bricks and start generating momentum. 𝗝𝗕𝗘𝗖𝗣 𝗣𝗨𝗣 𝗠𝗮𝗻𝗶𝗹𝗮 is gathering thinkers, devs, creatives, and Web3 explorers to move beyond theory.\\n\\n✅ 𝗜𝗻𝘀𝗽𝗶𝗿𝗶𝗻𝗴 𝗧𝗮𝗹𝗸𝘀: Learn from blockchain pioneers\\n✅ 𝗠𝗲𝗮𝗻𝗶𝗻𝗴𝗳𝘂𝗹 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻𝘀: Meet fellow first-movers, students, and founders\\n✅ 𝗛𝗮𝗻𝗱𝘀-𝗢𝗻 𝗪𝗼𝗿𝗸𝘀𝗵𝗼𝗽𝘀: Learn directly from blockchain pioneers\\n\\nFrom 𝗚𝗲𝗻𝗲𝘀𝗶𝘀 𝗕𝗹𝗼𝗰𝗸 to 𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 — we're not just learning about the future. We're building it together.\\n\\nThis isn't just another event.\\nThis is our momentum.\\n𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 is live.\\n\\n🎉 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗯𝗲𝗶𝗻𝗴 𝗽𝗮𝗿𝘁 𝗼𝗳 𝗼𝘂𝗿 𝗷𝗼𝘂𝗿𝗻𝗲𝘆!",
      image: "ipfs://bafybeih3r5jjgheyfmnx5am6kekt2meyvhpse5n52suu56ngi34i64o4eu",
      eventName: "BLOCKCELERATE 2025",
      date: "July 28, 2025",
    };
    // Create the event
    const tx = await jbecpNFT.createEvent(
      eventData.name,
      eventData.description,
      eventData.image,
      eventData.eventName,
      eventData.date
    );
    await tx.wait();

    const eventId = await jbecpNFT.totalEvents();
    console.log(`Event created with ID: ${eventId}`);
    console.log(`Event name: ${eventData.name}`);
    console.log(`Event description: ${eventData.description}`);
    console.log(`Event image: ${eventData.image}`);
    console.log(`Event event name: ${eventData.eventName}`);
    console.log(`Event date: ${eventData.date}`);

    console.log("Deployment completed!");
    console.log(`Contract address: ${address}`);
    console.log(`Event ID: ${eventId}`);
    console.log("Contract is ready for minting!");
    console.log(
      "To mint an NFT, call: mint(eventId, recipientAddress) where eventId = 1"
    );

    console.log("Minting NFT to my address...");
    const mintTx = await jbecpNFT.mint(1, deployerAddress);
    await mintTx.wait();
    console.log("NFT minted!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
