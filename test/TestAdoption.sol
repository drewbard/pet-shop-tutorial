pragma solidity ^0.4.18;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
    Adoption adoption = Adoption(DeployedAddresses.Adoption());

    // Testing the adopt() function
    function testUserCanAdoptPet() external {
        // given
        uint givenPetId = 8;
        uint expectedPetId = 8;

        // when
        uint actualPetId = adoption.adopt(givenPetId);

        // then
        Assert.equal(actualPetId, expectedPetId, "Adoption of pet ID 8 should be recorded.");
    }

    // Testing retrieval of a single pet's owner
    function testGetAdopterAddressByPetId() external {
        // given
        uint givenPetId = 8;
        // Expected owner is this contract
        address expectedAdopter = this;

        // when
        address actualAdopter = adoption.adopters(givenPetId);

        // then
        Assert.equal(actualAdopter, expectedAdopter, "Owner of pet ID 8 should be recorded.");
    }

    // Testing retrieval of all pet owners
    function testGetAdopterAddressByPetIdInArray() external {
        // given
        uint givenOwnersPetId = 8;
        address expectedOwner = this;

        // when
        // Store adopters in memory rather than contract's storage
        address[16] memory actualAdopters = adoption.getAdopters();

        // then
        Assert.equal(actualAdopters[givenOwnersPetId], expectedOwner, "Owner of pet ID 8 should be recorded.");
    }
}