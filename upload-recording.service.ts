import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { CONFIG } from '../constant/config';
import { Any } from 'json2typescript';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadRecordingService {

  serverAPIEndpoint = environment.API_ENDPOINT;
  
  constructor(private http: Http) { }

  uplaodVideoProposal(file: FormData){
    return this.http.post(this.serverAPIEndpoint+'/uploadVideoProposal/',file)
      .map((res: Response) =>{
        if (res) {
          if (res.status === 201) {
            return res.json();
          } else if (res.status === 200) {
            return res;
          }
        }
      }).catch((error: any) => {
        if (error.status < 400 || error.status === 500) {
          return error;
        }
      });
    }
}
