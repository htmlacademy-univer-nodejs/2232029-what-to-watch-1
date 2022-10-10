export interface IFileWriter {
  readonly filename: string;
  write(row: string): void;
}
