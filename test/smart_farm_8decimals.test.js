const web3 = require('web3');
const {accounts, contract} = require('@openzeppelin/test-environment');
const {BN, expectRevert, time, expectEvent, constants} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');
const rewardToken = contract.fromArtifact('Astronaut');
const MockBEP20 = contract.fromArtifact('MockBEP20');
const TreeFarm = contract.fromArtifact('TreeFarm');
let _deployer, a, b, c, d;

describe('TreeFarm', function () {
    beforeEach(async function () {
        _deployer = accounts[0];
        a = accounts[1];
        b = accounts[2];
        c = accounts[3];
        d = accounts[4];
        const deposit = web3.utils.toWei('100');
        this.rewardToken = await rewardToken.new("Astronaut", "NAUT", {from: _deployer});

        await this.rewardToken.mint(deposit, {from: _deployer});

        this.lp = await MockBEP20.new("lp", "lp", web3.utils.toWei('500'), {from: _deployer});
        await this.lp.transfer(a, deposit, {from: _deployer});
        await this.lp.transfer(b, deposit, {from: _deployer});
        await this.lp.transfer(c, deposit, {from: _deployer});
        await this.lp.transfer(d, deposit, {from: _deployer});

        const _rewardPerBlock = web3.utils.toWei('1');
        const _startBlock = 1;
        const _bonusEndBlock = _startBlock + 3600;

        this.pool = await TreeFarm.new(this.lp.address, this.rewardToken.address, _rewardPerBlock, _startBlock, _bonusEndBlock, {from: _deployer});

        // SafeMath: multiplication overflow -- Reason given: SafeMath: multiplication overflow.
        await this.rewardToken.transfer(this.pool.address, deposit, {from: _deployer});
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

            await this.lp.approve(this.pool.address, amount, {from: a});
            // await this.lp.approve(this.pool.address, amount, {from: b});
            // await this.lp.approve(this.pool.address, amount, {from: c});
            // await this.lp.approve(this.pool.address, amount, {from: d});

            await this.pool.deposit(amount, {from: a});
            // await this.pool.deposit(amount, {from: b});
            // await this.pool.deposit(amount, {from: c});
            // await this.pool.deposit(amount, {from: d});

            time.advanceBlock();
            console.log('1 block=', web3.utils.fromWei((await this.pool.pendingReward(a, {from: a})), 'ether').toString() );
            time.advanceBlock();
            console.log('2 block=', web3.utils.fromWei((await this.pool.pendingReward(a, {from: a})), 'ether').toString() );
            // console.log('b', web3.utils.fromWei((await this.pool.pendingReward(b, {from: b})), 'ether').toString() );
            // console.log('c', web3.utils.fromWei((await this.pool.pendingReward(c, {from: c})), 'ether').toString() );
            // console.log('d', web3.utils.fromWei((await this.pool.pendingReward(d, {from: d})), 'ether').toString() );

            await this.pool.withdraw(amount, {from: a});
            // await this.pool.withdraw(amount, {from: b});
            // await this.pool.withdraw(amount, {from: c});
            // await this.pool.withdraw(amount, {from: d});

            expect(web3.utils.fromWei((await this.lp.balanceOf(a, {from: a})), 'ether')).to.be.equal('100');
            // expect(web3.utils.fromWei((await this.lp.balanceOf(b, {from: b})), 'ether')).to.be.equal('100');
            // expect(web3.utils.fromWei((await this.lp.balanceOf(c, {from: c})), 'ether')).to.be.equal('100');
            // expect(web3.utils.fromWei((await this.lp.balanceOf(d, {from: d})), 'ether')).to.be.equal('100');

            expect(web3.utils.fromWei((await this.rewardToken.balanceOf(a, {from: a})), 'ether')).to.be.equal('3');
            console.log('withdraw must be 3 (2 blocks + withdraw):', web3.utils.fromWei((await this.rewardToken.balanceOf(a, {from: a})), 'ether').toString() );
            // expect(web3.utils.fromWei((await this.rewardToken.balanceOf(b, {from: b})), 'ether')).to.be.equal('16.666666666666666666');
            // expect(web3.utils.fromWei((await this.rewardToken.balanceOf(c, {from: c})), 'ether')).to.be.equal('16.666666666666666666');
            // expect(web3.utils.fromWei((await this.rewardToken.balanceOf(d, {from: d})), 'ether')).to.be.equal('23.333333333333333333');
        });
    });


});
