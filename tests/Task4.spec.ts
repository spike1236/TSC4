import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, beginCell } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });
    
    it('check correct encryption', async () => {
        const res = await task4.getEncrypt(5n, 'abcdABCD1234567890;{}');
        const ans = beginCell().storeUint(0, 32).storeStringTail('fghiFGHI1234567890;{}').endCell();
        expect(res).toEqualCell(ans);
    });
    it('check correct decryption', async () => {
        const res = await task4.getDecrypt(1n, 'BC78b');
        const ans = beginCell().storeUint(0, 32).storeStringTail('AB78a').endCell();
        expect(res).toEqualCell(ans);
    });
    it('check empty string encrypt', async () => {
        const res = await task4.getEncrypt(5n, '');
        const ans = beginCell().storeUint(0, 32).storeStringTail('').endCell();
        expect(res).toEqualCell(ans);
    });
    it('check empty string decrypt', async () => {
        const res = await task4.getDecrypt(5n, '');
        const ans = beginCell().storeUint(0, 32).storeStringTail('').endCell();
        expect(res).toEqualCell(ans);
    });
    it('check 1-element string encrypt', async () => {
        const res = await task4.getEncrypt(5n, 'A');
        const ans = beginCell().storeUint(0, 32).storeStringTail('F').endCell();
        expect(res).toEqualCell(ans);
    });
    it('check 1-element string decrypt', async () => {
        const res = await task4.getDecrypt(5n, 'F');
        const ans = beginCell().storeUint(0, 32).storeStringTail('A').endCell();
        expect(res).toEqualCell(ans);
    });
    
});
