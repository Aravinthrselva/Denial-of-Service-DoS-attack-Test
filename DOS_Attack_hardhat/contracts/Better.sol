// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


contract Better {
    address public currentWinner;
    uint public currentAuctionPrice;
    mapping(address => uint) public balances;

constructor() {
    currentWinner = msg.sender;
}

function setCurrentAuctionPrice() public payable {
    require(msg.value > currentAuctionPrice, "Bid price needs to be higher than the Current Auction Price");
    balances[currentWinner] += currentAuctionPrice;
    currentAuctionPrice = msg.value;
    currentWinner = msg.sender;
}

function withdraw() public {
    require(msg.sender != currentWinner, "Current winner is not allowed to withdraw");

    uint amount = balances[msg.sender];
    balances[msg.sender] = 0;

    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent, "ETH transaction failed");
    }

}