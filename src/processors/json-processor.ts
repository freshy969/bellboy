import fs from 'fs';
import path from 'path';

import { emit, IJsonProcessorConfig, processStream } from '../types';
import { DirectoryProcessor } from './base/directory-processor';

const JSONStream = require('JSONStream');

export class JsonProcessor extends DirectoryProcessor {

    protected jsonPath: string;

    constructor(config: IJsonProcessorConfig) {
        super(config);
        if (!config.jsonPath) {
            throw new Error('No JSON path specified.');
        }
        this.jsonPath = config.jsonPath;
    }

    async process(processStream: processStream, emit: emit) {
        for (const file of this.files) {
            const filePath = path.join(this.path, file);
            await emit('processingFile', file, filePath);
            const readStream = fs.createReadStream(filePath).pipe(JSONStream.parse(this.jsonPath));
            readStream.pause();
            await processStream(readStream);
            await emit('processedFile', file, filePath);
        };
    }
}
