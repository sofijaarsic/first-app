import { Component, Input, OnInit } from '@angular/core';
import { MemoService } from '../service/memo.service';
import { ModalController, ToastController } from '@ionic/angular';
import { FavoriteService } from '../service/favorite.service';
import { Memo } from 'src/memo.model';

@Component({
  selector: 'app-memo',
  templateUrl: './memo.component.html',
  styleUrls: ['./memo.component.scss'],
})
export class MemoComponent implements OnInit {
  @Input() id: string;

  userId: any;
  title: string;
  content: string;
  createdAt: any;
  formattedDate: any;
  memos: Memo[] = [];
  memo: Memo;
  constructor(
    private memoService: MemoService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private favService: FavoriteService
  ) {}

  ngOnInit() {
    this.memoService.getMemoById(this.id).subscribe((res) => {
      console.log('ngOnInit');

      console.log(res.id);
      this.memo = res;
    });
  }
  async updateMemo() {
    this.memoService.updateMemo(
      this.id,
      this.memo.title,
      this.memo.content,
      new Date(),
      this.memo.userId
    );

    const toast = await this.toastCtrl.create({
      message: 'Memo updated!',
      duration: 2000,
    });
    toast.present();
    this.modalCtrl.dismiss();
  }

  async deleteMemo() {
    this.memoService.deleteMemo(this.id);
    this.modalCtrl.dismiss();
  }
  addToFavorites() {
    console.log('id od dodate fav');

    console.log(this.memo.id);

    //TODO
    this.favService.getMemos().subscribe((res) => {
      console.log(res);
      this.memos = res;
      let exists = false;
      // this.memos.forEach((f) => {
      //   console.log(this.memo);
      //   if (f.id == this.memo.id) {
      //     console.log('Uso u if');
      //     exists = true;
      //   }
      // });

      if (exists == false) {
        console.log(this.memo);

        this.favService.addToFavorites(
          this.memo.title,
          this.memo.content,
          this.memo.createdAt,
          this.memo.id
        );
        console.log('memos nakon dodavanja u favorite');

        console.log(this.memos);
      }
    });
  }
}
