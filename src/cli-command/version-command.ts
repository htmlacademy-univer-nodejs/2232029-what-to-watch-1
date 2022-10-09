import { ICliCommand} from './cli-command.interface.js';
import {readFileSync} from 'fs';
import chalk from 'chalk';

export default class VersionCommand implements ICliCommand {
  public readonly name = '--version';

  private getVersion(): string {
    const content = JSON.parse(readFileSync('./package.json','utf-8'));
    return content.version;
  }

  public async execute() {
    const version = this.getVersion();
    console.log(chalk.greenBright(chalk.bgGrey(version)));
  }
}
