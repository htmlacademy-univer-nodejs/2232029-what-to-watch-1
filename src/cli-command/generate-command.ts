import {ICliCommand} from './cli-command.interface.js';
import {TMockData} from '../models/mock-data-type';
import TSVFileWriter from '../common/file-writer/film-tsv-file-writer.js';
import got from 'got';
import FilmGenerator from '../common/film-generator/film-generator.js';

export default class GenerateCommand implements ICliCommand {
  public readonly name = '--generate';
  private initialData!: TMockData;

  public async execute(...parameters:string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);

    try {
      this.initialData = await got.get(url).json();
    } catch {
      return console.log(`Can't fetch data from ${url}.`);
    }

    const offerGeneratorString = new FilmGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(offerGeneratorString.generate());
    }

    console.log(`File ${filepath} was created!`);
  }
}
