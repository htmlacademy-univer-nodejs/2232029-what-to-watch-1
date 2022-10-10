import {ICliCommand} from './cli-command.interface.js';
import {FilmTsvFileReader} from '../common/file-reader/film-tsv-file-reader.js';
import {createFilm} from '../utils/common.js';

export default class ImportCommand implements ICliCommand {
  public readonly name = '--import';

  private static onLine(line: string) {
    const offer = createFilm(line);
    console.log(offer);
  }

  private static onComplete(count: number) {
    console.log(`${count} rows imported.`);
  }

  public async execute(filename: string): Promise<void> {
    const fileReader = new FilmTsvFileReader(filename.trim());
    fileReader.on('line', ImportCommand.onLine);
    fileReader.on('end', ImportCommand.onComplete);

    try {
      await fileReader.read();
    } catch (err) {

      if (!(err instanceof Error)) {
        throw err;
      }

      console.log(`Не удалось импортировать данные. ${err.message}`);
    }
  }
}
