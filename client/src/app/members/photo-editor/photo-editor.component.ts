import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';

import { AccountService } from 'src/app/_services/account.service';
import { environment } from 'src/environments/environment';
import { Member } from 'src/app/_models/member.model';
import { MembersService } from 'src/app/_services/members.service';
import { Photo } from 'src/app/_models/photo.model';
import { User } from 'src/app/_models/user.model';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member | undefined;
  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;
  baseUrl = environment.apiUrl;
  user: User | undefined;

  constructor(private accountService: AccountService, private memberService: MembersService) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          if (user) this.user = user;
        }
      });
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: false,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo: Photo = JSON.parse(response);
        this.member?.photos.push(photo);

        if (this.user && this.member && photo.isMain) {
          this.user.photoUrl = this.member.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
        }
      }
    }
  }

  setMainPhoto(photo: Photo) {
    if (!this.member) return;

    this.memberService.setMainPhoto(this.member, photo).subscribe({
      next: () => {
        const photoUrl = photo.url;

        if (this.user && this.member) {
          this.user.photoUrl = photoUrl;
          this.member.photoUrl = photoUrl;
          this.member.photos.forEach((photoMember) => {
            photoMember.isMain = photoMember.id === photo.id;
          });

          this.accountService.setCurrentUser(this.user);
        }
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  deletePhoto(photo: Photo) {
    if (!this.member) return;

    this.memberService.deletePhoto(this.member, photo).subscribe({
      error: (error: any) => {
        console.log(error);
      }
    });
  }
}
