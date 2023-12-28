import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TimeagoModule } from 'ngx-timeago';
import { ToastrService } from 'ngx-toastr';

import { Message } from 'src/app/_models/message.model';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
  imports: [CommonModule, FormsModule, TimeagoModule]
})
export class MemberMessagesComponent implements OnInit {
  @Input() messages: Message[] = [];
  @Input() memberName: string | undefined;
  @ViewChild('messageForm') messageForm: NgForm | undefined;

  constructor(private messageService: MessageService, private toastr: ToastrService) { }

  get hasMessages() {
    return this.messages.length > 0;
  }

  ngOnInit(): void {
  }

  sendMessage() {
    if (this.messageForm && this.memberName) {
      const content: string = this.messageForm.value.content;
      if (content) {
        this.messageService.sendMessage(this.memberName, content).subscribe({
          next: message => {
            this.toastr.info('Message was successfully sent to user : ' + this.memberName);
            this.messages.push(message);
            this.messageForm?.resetForm();
          }
        });
      }
    }

  }
}
