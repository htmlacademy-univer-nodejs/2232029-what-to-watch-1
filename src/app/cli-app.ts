import {ICliCommand} from '../cli-command/cli-command.interface';

type ParsedCommands = Record<string, string[]>;

export default class CLIApplication {
  private readonly defaultCommand = '--help';
  private commands: Record<string, ICliCommand> = {};

  public registerCommands(args: ICliCommand[]): void {
    args.reduce((acc, command) => {
      acc[command.name] = command;
      return acc;
    }, this.commands);
  }

  private parseCommands(args: string[]): ParsedCommands {
    const parsedCommand: ParsedCommands = {};
    let command = '';

    return args.reduce((acc, item) => {
      if (item.startsWith('--')) {
        acc[item] = [];
        command = item;
      } else if (command && item) {
        acc[command].push(item);
      }

      return acc;
    }, parsedCommand);
  }

  public processCommand(argv: string[]): void {
    const parsedCommand = this.parseCommands(argv);
    const [commandName] = Object.keys(parsedCommand);
    const command = this.getCommand(commandName);
    const commandArguments = parsedCommand[commandName] ?? [];
    command.execute(...commandArguments);
  }

  private getCommand(commandName: string): ICliCommand {
    return this.commands[commandName] ?? this.commands[this.defaultCommand];
  }
}
