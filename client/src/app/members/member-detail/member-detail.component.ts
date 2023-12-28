import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';

import { Member } from 'src/app/_models/member.model';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { MembersService } from 'src/app/_services/members.service';
import { Message } from 'src/app/_models/message.model';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  imports: [CommonModule, GalleryModule, TabsModule, TimeagoModule, MemberMessagesComponent]
})
export class MemberDetailComponent implements OnInit {
  member: Member = {} as Member;
  messages: Message[] = [];
  galleryImages: GalleryItem[] = [];
  @ViewChild('memberTabs', { static: true }) memberTabs?: TabsetComponent;
  activeTab?: TabDirective;

  constructor(private memberService: MembersService, private messageService: MessageService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (data) => {
        this.member = data['member'];
        this.galleryImages = this.getImages();
      }
    });

    this.route.queryParams.subscribe({
      next: (params) => {
        params['tab'] && this.selectTab('Messages')
      }
    });
  }

  onTabActivated(memberTab: TabDirective) {
    this.activeTab = memberTab;
    if (this.activeTab.heading === 'Messages') {
      this.loadMessages();
    }
  }

  getImages() {
    if (!this.member) return [];

    const images: GalleryItem[] = [];
    for (const photo of this.member.photos) {
      images.push(new ImageItem({ src: photo.url, thumb: photo.url }));
    }

    return images;
  }

  loadMessages() {
    if (!this.member) return;

    this.messageService.getMessageThread(this.member.userName).subscribe({
      next: response => {
        this.messages = response;
      }
    });
  }

  selectTab(heading: string) {
    if (this.memberTabs) {
      this.memberTabs.tabs.find(x => x.heading === heading)!.active = true;
    }
  }
}
