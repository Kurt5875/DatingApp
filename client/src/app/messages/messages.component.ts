import { Component, OnInit } from '@angular/core';

import { Message } from '../_models/message.model';
import { MessageService } from '../_services/message.service';
import { Pagination } from '../_models/pagination.model';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  pageNumber = 1;
  pageSize = 3;
  container = 'Inbox';
  messages?: Message[];
  pagination?: Pagination;
  loading = false;

  constructor(private messageService: MessageService) { }

  get hasMessages() {
    return this.messages && this.messages.length > 0;
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe({
      next: response => {
        this.messages = response.results;
        this.pagination = response.pagination;
        this.loading = false;
      }
    });
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.messages?.splice(this.messages.findIndex(m => m.id === id), 1)
      }
    });
  }

  pageChanged(event: PageChangedEvent) {
    if (event.page !== this.pagination?.currentPage) {
      this.pageNumber = event.page;
      this.pageSize = event.itemsPerPage;

      this.loadMessages();
    }
  }
}
