pragma solidity ^0.6.0;

import "./CrowdFundingCampaing.sol";

contract CrowdFoundingCampaingCRUD {


    address[] public listOfCFC;
    mapping(string => bool) names;
    mapping(string => address) campaingsByName;


    function createCrowdFoundingCampaing(string calldata _name, uint _minimunContribution, uint _goal)
    external payable returns (address) {

        require(
            !names[_name],
            "Ya hay una campaña con ese nombre"
        );

        address newCFC = address(new CrowdFundingCampaing(_name, _minimunContribution, _goal, msg.sender));

        listOfCFC.push(newCFC);
        names[_name] = true;
        campaingsByName[_name] = newCFC;

        return newCFC;
    }

    function getListOfCFC() public view returns (address[] memory){
        return listOfCFC;
    }

}
