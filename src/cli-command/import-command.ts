import {ICliCommand} from './cli-command.interface.js';
import {FilmTsvFileReader} from '../common/fileReader/film-tsv-file-reader.js';


export default class ImportCommand implements ICliCommand {
  public readonly name = '--import';
  public execute(filename: string): void {
    const fileReader = new FilmTsvFileReader(filename.trim());

    try {
      fileReader.read();
      console.log(fileReader.toArray());
    } catch (err) {

      if (!(err instanceof Error)) {
        throw err;
      }

      console.log(`Не удалось импортировать данные. ${err.message}`);
    }
  }
}
