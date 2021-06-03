import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SessionService } from '../services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { QueueModel } from '../../common-features/models/queue-model';

@Component({
  selector: 'app-queues',
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent implements OnInit {

  queues: any[] = [];


  constructor(private router: Router, private route: ActivatedRoute, private matDialog: MatDialog, private server: FirestoreService
    , public utils: UtilsService, public session: SessionService) {
  }

  ngOnInit(): void {

  }

  private showDialog(type: string, msg: string, ok: string, queue: QueueModel): void {

    let dialogData = {
      type: type,
      message: msg,
      okText: ok
    }

    this.matDialog.open(MessageDialogComponent, {
      data: dialogData, disableClose: false,
      maxWidth: '300px'
    }).afterClosed().toPromise()
      .then(result => {
        if (queue !== null && result.approved) {
          this.deleteQueue(queue);
        }

      });
  }


  private deleteQueue(queue: QueueModel): void {
    this.server.delete("user-data/" + this.session.getUserData().getUserId() + "/queues", queue.getQueueId())
      .then(() => {

      })
      .catch(error => {
        this.showDialog('fail', 'Could not delete queue at this time please try again. If you keep getting this error, please contact support at support@doctormeetup.com', 'Close', null);
      });
  }
  queueStatusChanged(queue: QueueModel) {

    queue.setLoading(true);
    this.server.update('user-data/' + this.session.getUserData().getUserId() + '/queues', queue.getQueueId(), { 'active': !queue.isActive() })
      .then(() => {
        queue.setLoading(false);
      })
      .catch(error => {
        //error
        queue.setLoading(false);
      });

  }

  deletClick(queue: QueueModel): void {
    this.showDialog('alert', 'Are you sure, you want to delete your queue?', 'Yes', queue);
  }
  editQueue(queue: QueueModel): void {

    this.session.setSharedData(queue);

    this.router.navigate(['doctor/queues/editQueue']);

  }

  goToCreateQueue() {
    this.router.navigate(['createQueue'], { relativeTo: this.route });
  }
}

// this.router.navigate(['createQueue'], { relativeTo: this.route });
