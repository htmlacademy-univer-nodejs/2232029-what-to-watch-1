import {createReadStream } from 'fs';
import {IFileReader} from './file-reader-interface.js';
import EventEmitter from 'events';

export class FilmTsvFileReader extends EventEmitter implements IFileReader {
  constructor(public filePath: string) {
    super();
  }

  public async read():Promise<void> {
    const stream = createReadStream(this.filePath, {
      highWaterMark: 16384, // 16KB
      encoding: 'utf-8',
    });

    let lineRead = '';
    let endLinePosition = -1;
    let importedRowCount = 0;

    for await (const chunk of stream) {
      lineRead += chunk.toString();

      while ((endLinePosition = lineRead.indexOf('\n')) >= 0) {
        const completeRow = lineRead.slice(0, endLinePosition + 1);
        lineRead = lineRead.slice(++endLinePosition);
        importedRowCount++;

        await new Promise((resolve) => {
          this.emit('line', completeRow, resolve);
        });
      }
    }

    this.emit('end', importedRowCount);
  }
}
