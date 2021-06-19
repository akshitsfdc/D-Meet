


import { UtilsService } from 'src/app/services/utils.service';
import { CalculationService } from './calculation.service';
import { QueueModel } from './../models/queue-model';
import { DoctorUserData } from './../../../models/doctor-user-data';
import { BookedPatient } from './../models/booked-patient';

import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable()

export class ManagementService {

    constructor() {
    }

    public presenseManagement(userId: string, isDoctor: boolean): void {

        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        const userStatusDatabaseRef = firebase.database().ref('/status/' + userId);

        // We'll create two constants which we will write to
        // the Realtime database when this device is offline
        // or online.
        const isOfflineForDatabase = {
            status: 'offline',
            doctor: isDoctor,
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };

        const isOnlineForDatabase = {
            status: 'online',
            doctor: isDoctor,
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };

        // Create a reference to the special '.info/connected' path in
        // Realtime Database. This path returns `true` when connected
        // and `false` when disconnected.
        firebase.database().ref('.info/connected').on('value', snapshot => {

            console.log('Management called : ' + userId);
            console.log('Management called : ' + isDoctor);

            // If we're not currently connected, don't do anything.
            if (snapshot.val() === false) {
                return;
            }

            // If we are currently connected, then use the 'onDisconnect()'
            // method to add a set which will only trigger once this
            // client has disconnected by closing the app,
            // losing internet, or any other means.
            userStatusDatabaseRef.onDisconnect().update(isOfflineForDatabase).then(() => {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect()
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                userStatusDatabaseRef.update(isOnlineForDatabase);
            });
        });
    }

}
