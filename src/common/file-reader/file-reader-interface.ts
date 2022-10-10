export interface IFileReader {
  readonly filePath: string;
  read(): void;
}
