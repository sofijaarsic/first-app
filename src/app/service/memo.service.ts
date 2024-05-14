import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Memo } from 'src/memo.model';
import { AuthenticationService } from '../auth/authentication.service';
interface MemoData {
  title: string;
  content: string;
  createdAt: any;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class MemoService {
  private _memos = new BehaviorSubject<Memo[]>([]);
  get memos(): Observable<Memo[]> {
    return this._memos.asObservable();
  }
  constructor(
    private authService: AuthenticationService,
    private http: HttpClient
  ) {}

  addMemo(title: string, content: string, createdAt: any) {
    let generatedId: string;
    const userId: string = this.authService.getUserId();
    return this.http
      .post<{ name: string }>(
        `${
          environment.firebaseRDBUrl
        }/memos.json?auth=${this.authService.getToken()}`,
        {
          title,
          content,
          createdAt,
          userId,
        }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this._memos;
        }),
        take(1),
        tap((memos) => {
          this._memos.next(
            memos.concat({
              id: generatedId,
              title,
              content,
              createdAt,
              userId,
            })
          );
        })
      );
  }
  // &orderBy="userId"&equalTo="${id}"
  getMemos() {
    console.log('geetMemos');
    const id = this.authService.getUserId();
    console.log(this.authService.getUserId());

    return this.http
      .get<{ [key: string]: MemoData }>(
        `${
          environment.firebaseRDBUrl
        }/memos.json?auth=${this.authService.getToken()}&orderBy="userId"&equalTo="${id}"`
      )
      .pipe(
        map((memosData: any) => {
          const memos: Memo[] = [];
          for (const key in memosData) {
            memos.push({
              id: key,
              title: memosData[key].title,
              content: memosData[key].content,
              createdAt: memosData[key].createdAt,
              userId: memosData[key].userId,
            });
          }
          console.log('vratio');
          console.log(memos);
          return memos;
        }),
        tap((memos) => {
          this._memos.next(memos);
        })
      );
  }

  getMemoById(id: string) {
    console.log('getmemo');

    console.log(
      this.http
        .get<MemoData>(
          `${
            environment.firebaseRDBUrl
          }/memos/${id}.json?auth=${this.authService.getToken()}`
        )
        .pipe(
          map((resData) => {
            return {
              id,
              title: resData.title,
              content: resData.content,
              userId: resData.userId,
              createdAt: resData.createdAt,
            };
          })
        )
    );

    return this.http
      .get<MemoData>(
        `${
          environment.firebaseRDBUrl
        }/memos/${id}.json?auth=${this.authService.getToken()}`
      )
      .pipe(
        map((resData) => {
          return {
            id,
            title: resData.title,
            content: resData.content,
            userId: resData.userId,
            createdAt: resData.createdAt,
          };
        })
      );
  }

  updateMemo(
    id: string,
    title: string,
    content: string,
    createdAt: any,
    userId: string
  ) {
    console.log('memo service update');

    console.log(id, title, content, createdAt, userId);
    console.log(
      this.http
        .put(
          `${
            environment.firebaseRDBUrl
          }/memos/${id}.json?auth=${this.authService.getToken()}`,
          { content, createdAt, title, userId }
        )
        .pipe(
          switchMap(() => this.memos),
          take(1),
          tap((memos) => {
            const updatedMemoIndex = memos.findIndex((q) => q.id === id);
            const updatedMemos = [...memos];

            updatedMemos[updatedMemoIndex] = {
              id,
              content,
              createdAt,
              title,
              userId,
            };
            this._memos.next(updatedMemos);
          })
        )
    );

    return this.http
      .put(
        `${
          environment.firebaseRDBUrl
        }/memos/${id}.json?auth=${this.authService.getToken()}`,
        { content, createdAt, title, userId }
      )
      .pipe(
        switchMap(() => this.memos),
        take(1),
        tap((memos) => {
          const updatedMemoIndex = memos.findIndex((q) => q.id === id);
          const updatedMemos = [...memos];

          updatedMemos[updatedMemoIndex] = {
            id,
            content,
            createdAt,
            title,
            userId,
          };
          this._memos.next(updatedMemos);
        })
      );
  }
  // deleteMemo(id: string) {
  //   return this.http
  //     .delete<void>(
  //       `${
  //         environment.firebaseRDBUrl
  //       }memos/${id}.json?auth=${this.authService.getToken()}`
  //     )
  //     .pipe(
  //       switchMap(() => {
  //         const updatedTransactions = this._memos.value.filter(
  //           (transaction) => transaction.id !== id
  //         );

  //         this._memos.next(updatedTransactions);
  //         return of(updatedTransactions);
  //       })
  //     );
  // }
  deleteMemo(id: string) {
    return this.http
      .delete<void>(
        `${
          environment.firebaseRDBUrl
        }/memos/${id}.json?auth=${this.authService.getToken()}`
      )
      .pipe(
        switchMap(() => {
          return this.memos;
        }),
        take(1),
        tap((memos) => {
          this._memos.next(memos.filter((q) => q.id !== id));
        })
      );
  }
}
