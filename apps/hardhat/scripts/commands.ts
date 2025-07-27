import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const contractAddress = "0x2D3eC470C053Aa2Eb9b54bC20cD0aCbc5ff9fb97";

  const JBECPNFT = await ethers.getContractAt("JBECPPUPNFT", contractAddress);

  console.log("Creating new event");
  const eventData = {
    name: "BLOCKCELERATE 2025 NFT Test",
    description:
      "𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗮𝘁𝘁𝗲𝗻𝗱𝗶𝗻𝗴 𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 𝟮𝟬𝟮𝟱: 𝗧𝗵𝗶𝘀 𝗜𝘀 𝗢𝘂𝗿 𝗠𝗼𝗺𝗲𝗻𝘁𝘂𝗺! 🚀\\n\\n𝗧𝗮𝗹𝗸𝘀 · 𝗡𝗲𝘁𝘄𝗼𝗿𝗸𝗶𝗻𝗴 · 𝗕𝘂𝗶𝗹𝗱𝗲𝗿𝘀\\n🗓 𝗗𝗮𝘁𝗲: July 28, 2025\\n🕐 𝗧𝗶𝗺𝗲: 1:00 PM – 6:00 PM\\n📍 𝗩𝗲𝗻𝘂𝗲: ArthaLand Century Pacific Tower, BGC\\n\\nThere's a reason it starts with a block — solid, foundational, essential.\\nBut 𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 is about what comes next: when builders stop stacking bricks and start generating momentum. 𝗝𝗕𝗘𝗖𝗣 𝗣𝗨𝗣 𝗠𝗮𝗻𝗶𝗹𝗮 is gathering thinkers, devs, creatives, and Web3 explorers to move beyond theory.\\n\\n✅ 𝗜𝗻𝘀𝗽𝗶𝗿𝗶𝗻𝗴 𝗧𝗮𝗹𝗸𝘀: Learn from blockchain pioneers\\n✅ 𝗠𝗲𝗮𝗻𝗶𝗻𝗴𝗳𝘂𝗹 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻𝘀: Meet fellow first-movers, students, and founders\\n✅ 𝗛𝗮𝗻𝗱𝘀-𝗢𝗻 𝗪𝗼𝗿𝗸𝘀𝗵𝗼𝗽𝘀: Learn directly from blockchain pioneers\\n\\nFrom 𝗚𝗲𝗻𝗲𝘀𝗶𝘀 𝗕𝗹𝗼𝗰𝗸 to 𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 — we're not just learning about the future. We're building it together.\\n\\nThis isn't just another event.\\nThis is our momentum.\\n𝗕𝗟𝗢𝗖𝗞𝗖𝗘𝗟𝗘𝗥𝗔𝗧𝗘 is live.\\n\\n🎉 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗯𝗲𝗶𝗻𝗴 𝗽𝗮𝗿𝘁 𝗼𝗳 𝗼𝘂𝗿 𝗷𝗼𝘂𝗿𝗻𝗲𝘆!",
    image: "ipfs://bafybeih3r5jjgheyfmnx5am6kekt2meyvhpse5n52suu56ngi34i64o4eu",
    eventName: "BLOCKCELERATE 2025",
    date: "July 28, 2025",
  };
  const tx = await JBECPNFT.createEvent(
    eventData.name,
    eventData.description,
    eventData.image,
    eventData.eventName,
    eventData.date
  );
  await tx.wait();
  console.log("Event created");
  console.log("Minting NFT to my address...");
  const mintTx = await JBECPNFT.mint(2, deployer.address);
  await mintTx.wait();
  console.log("NFT minted!");
  //   console.log("get metadata:", await JBECPNFT.getMetadata(tokenId));
}

main();
