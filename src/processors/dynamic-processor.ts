import { Stream } from 'stream';

import { IDynamicProcessorConfig, processStream, emit } from '../types';
import { Processor } from './base/processor';

export class DynamicProcessor extends Processor {

    protected generator: () => AsyncIterableIterator<any>;

    constructor(config: IDynamicProcessorConfig) {
        super(config);
        if (!config.generator) {
            throw Error(`No generator function specified.`);
        }
        this.generator = config.generator;
    }

    async process(processStream: processStream, emit: emit) {
        const iterator = this.generator();
        const readStream = new Stream.Readable({
            objectMode: true,
            async read() {
                const result = await iterator.next();
                if (result.done) {
                    return this.push(null);
                }
                this.push(result.value);
            },
        }).pause();
        await processStream(readStream);
    }
}
