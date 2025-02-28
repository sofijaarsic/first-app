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
export class FavoriteService {
  private _memos = new BehaviorSubject<Memo[]>([]);
  get favorites(): Observable<Memo[]> {
    return this._memos.asObservable();
  }
  constructor(
    private authService: AuthenticationService,
    private http: HttpClient
  ) {}

  addToFavorites(
    title: string,
    content: string,
    createdAt: any,
    idMemo: string
  ) {
    let generatedId: string;
    const userId: string = this.authService.getUserId();
    console.log('add to favs');

    console.log(content, createdAt, title, userId, idMemo);

    return this.http
      .post<{ name: string }>(
        `${
          environment.firebaseRDBUrl
        }/favorites.json?auth=${this.authService.getToken()}`,
        {
          content,
          createdAt,
          title,
          userId,
          idMemo,
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
              originalMemoId: idMemo,
            })
          );
        })
      );
  }

  getMemos() {
    return this.http
      .get<{ [key: string]: MemoData }>(
        `${
          environment.firebaseRDBUrl
        }/favorites/.json?auth=${this.authService.getToken()}&orderBy="userId"&equalTo="${this.authService.getUserId()}"`
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
          return memos;
        }),
        tap((memos) => {
          this._memos.next(memos);
        })
      );
  }

  getMemoById(id: string) {
    return this.http
      .get<MemoData>(
        `${
          environment.firebaseRDBUrl
        }/favorites/${id}.json?auth=${this.authService.getToken()}`
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

  // deleteMemo(id: string) {
  //   return this.http
  //     .delete(
  //       `${
  //         environment.firebaseRDBUrl
  //       }/favorites/${id}.json?auth=${this.authService.getToken()}`
  //     )
  //     .pipe(
  //       switchMap(() => {
  //         return this.favorites;
  //       }),
  //       take(1),
  //       tap((memos) => {
  //         this._memos.next(memos.filter((q) => q.id !== id));
  //       })
  //     );
  // }
}
