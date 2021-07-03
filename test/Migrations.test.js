const Migrations = artifacts.require("Migrations");

const { time } = require('openzeppelin-test-helpers');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Migrations Test", async accounts => {

    const [authorAddress, otherAddress] = accounts;

    beforeEach(async() => {
        this.migrations = await Migrations.deployed();
    })


    it("When Migrations is created the owner must be the sender", async() => {

        const migrations = this.migrations;

        expect(migrations).to.be.instanceof(Migrations);
        expect(migrations.owner()).to.eventually.be.equal(authorAddress);

        
    });

    it("Only owner can set Completed", async() => {

        const migrations = this.migrations;

        expect(migrations.owner()).to.eventually.be.equal(authorAddress);
        expect(migrations.owner()).to.eventually.not.be.equal(otherAddress);
        expect(migrations.last_completed_migration()).to.eventually.be.a.bignumber.equal(new BN(0));

        await migrations.setCompleted(25, { from: otherAddress });
        expect(migrations.last_completed_migration()).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("Owner can set completed", async() => {

        const migrations = this.migrations;

        expect(migrations.owner()).to.eventually.be.equal(authorAddress);
        
        await migrations.setCompleted(19, { from: authorAddress });
        expect(migrations.last_completed_migration()).to.eventually.be.a.bignumber.equal(new BN(19));
    });

   
    


});