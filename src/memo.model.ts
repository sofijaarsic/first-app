export interface Memo {
  id?: string; //? znaci da je optional
  userId: string;
  title: string;
  content: string;
  createdAt: any;
  originalMemoId?: string;
}
