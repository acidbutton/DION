export interface BoardFolder {
  id: string;
  name: string;
  children?: BoardFolder[];
}

export type BoardOwnership = 'me' | 'shared';

export interface Board {
  id: string;
  title: string;
  ownership: BoardOwnership;
  ownerLabel: string;
  modifiedAt: Date;
  thumbnail: number;
  folderId?: string;
}
