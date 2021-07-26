
import { Injectable } from "@angular/core";
import { SessionService } from "./session.service";

@Injectable()

export class DoctorHelperService {

    public showQueuesOnDashboard(session: SessionService): boolean {
        if (!session) {
            return false;
        }
        if (session.getUserData().getQueues() && session.getUserData().getQueues().length == 0) {
            return false;
        }
        return true;
    }
}