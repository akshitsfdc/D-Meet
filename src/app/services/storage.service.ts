import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private angularFireStorage: AngularFireStorage) { }


  saveFile(path:string, file:File): AngularFireUploadTask{
    return this.angularFireStorage.ref(path).put(file);
  }
  saveFileWithBlob(path:string, file:Blob): AngularFireUploadTask{
    return this.angularFireStorage.ref(path).put(file);
  }
  saveWithBase64(path:string, file:string): AngularFireUploadTask{
    return this.angularFireStorage.ref(path).putString(file);
  }
  getURL(path:string){
    return this.angularFireStorage.ref(path).getDownloadURL().toPromise();
  }

}
