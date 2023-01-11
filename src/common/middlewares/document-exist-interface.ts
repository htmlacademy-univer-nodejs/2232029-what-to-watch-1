export interface IDocumentExists {
  exists(documentId: string): Promise<boolean>;
}
