import * as fs from 'fs';

import { Job, TailProcessor } from '../src';
import { CustomDestination } from './helpers';

const filePath = 'test.txt';
let interval: any;

beforeAll(async () => {
});

beforeEach(async () => {
    fs.appendFileSync(filePath, 'First line\n');
    fs.appendFileSync(filePath, 'Second line\n');
    interval = setInterval(function () {
        fs.appendFileSync(filePath, 'Hello, world!\n');
    }, 1000);
});

afterEach(async () => {
    clearInterval(interval);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
});

afterAll(async () => {
});

it('tails file', async () => {
    const destination = new CustomDestination({
        batchSize: 1,
    });
    const processor = new TailProcessor({
        path: './',
        files: [filePath],
    });
    const job = new Job(processor, [destination]);
    job.on('loadedBatch', async () => {
        return true;
    });
    await job.run();
    expect(destination.getData()).toEqual([{ file: filePath, data: 'Hello, world!' }]);
});

it('tails file from beginning', async () => {
    const destination = new CustomDestination({
        batchSize: 3,
    });
    const processor = new TailProcessor({
        path: './',
        files: [filePath],
        fromBeginning: true,
    });
    const job = new Job(processor, [destination]);
    job.on('loadedBatch', async () => {
        return true;
    });
    await job.run();
    expect(destination.getData()).toEqual([
        { file: filePath, data: 'First line' },
        { file: filePath, data: 'Second line' },
        { file: filePath, data: 'Hello, world!' },
    ]);
});

