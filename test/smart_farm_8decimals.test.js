const web3 = require('web3');
const {accounts, contract} = require('@openzeppelin/test-environment');
const {BN, expectRevert, time, expectEvent, constants} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');
const Astronaut = contract.fromArtifact('Astronaut');
const MockBEP20 = contract.fromArtifact('MockBEP20');
const TreeFarm = contract.fromArtifact('TreeFarm');
let _deployer;

describe('TreeFarm', function () {
    beforeEach(async function () {
        _deployer = accounts[0];
        const deposit = web3.utils.toWei('1000');
        this.rewardedToken = await Astronaut.new({from: _deployer});
        // await this.rewardedToken.deliver(1, {from: _deployer});
        this.lp = await MockBEP20.new("lp", "lp", deposit, {from: _deployer});

        const _rewardPerBlock = web3.utils.toWei('1');
        const _startBlock = 1;
        const _bonusEndBlock = _startBlock + 3600;

        this.pool = await TreeFarm.new(this.lp.address, this.rewardedToken.address, _rewardPerBlock, _startBlock, _bonusEndBlock, {from: _deployer});

        // SafeMath: multiplication overflow -- Reason given: SafeMath: multiplication overflow.
        await this.rewardedToken.transfer(this.pool.address, deposit, {from: _deployer});
    });

    describe('TreeFarm', function () {
        it('DEPOSIT', async function () {
            const amount = web3.utils.toWei('100');
            // const balanceOf1 = await this.lp.balanceOf(_deployer, {from: _deployer});
            // console.log('balanceOf1', balanceOf1.toString() );
            await this.lp.approve(this.pool.address, amount, {from: _deployer});
            await this.pool.deposit(amount, {from: _deployer});
            // const balanceOf2 = await this.lp.balanceOf(this.pool.address, {from: _deployer});
            // console.log('balanceOf2', balanceOf2.toString() );
            time.advanceBlock();
            // const pendingReward = await this.pool.pendingReward(_deployer, {from: _deployer});
        });
        it('WITHDRAW', async function () {
            const amount = web3.utils.toWei('100');
            await this.lp.approve(this.pool.address, amount, {from: _deployer});
            await this.pool.deposit(amount, {from: _deployer});
            time.advanceBlock();

            const pendingReward = await this.pool.pendingReward(_deployer, {from: _deployer});
            const pendingRewardD = web3.utils.fromWei(pendingReward, 'ether').toString();
            console.log('pendingReward', pendingRewardD);

            await this.pool.withdraw(amount, {from: _deployer});

            const balanceOfLp = await this.lp.balanceOf(_deployer, {from: _deployer});
            const balanceOfReward = await this.rewardedToken.balanceOf(_deployer, {from: _deployer});
            // console.log('balanceOfLp', balanceOfLp.toString() );
            // console.log('balanceOfReward', balanceOfReward.toString() );

            expect(web3.utils.fromWei(balanceOfLp, 'ether')).to.be.equal('1000');
            expect(web3.utils.fromWei(balanceOfReward, 'ether')).to.be.equal('1');


        });
    });


});
