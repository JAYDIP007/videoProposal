import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UploadRecordingService } from './upload-recording.service';
import Swal from 'sweetalert2';
import { SessionService } from '../constant/sessionService.component.service';
import { LoaderService } from '../services/loader.service';
import { uploadConstants } from '../constant/appConstant';
//import * as RecordRTC from 'recordrtc';

declare var MediaRecorder: any;
@Component({
  selector: 'app-vedio-record',
  templateUrl: './vedio-record.component.html',
  styleUrls: ['./vedio-record.component.css']
})
export class VedioRecordComponent implements OnInit {

  preview: any;
  recPreview: any;
  startButton: any;
  stopButton: any;
  downloadButton: any;
  Retake: any;
  Upload: any;
  processing: any;
  start: any;
  recordingTimeMS: any;
  recordedBlob: any;
  UploadData: any = [];
  next: any;
  userId: any;
  recorder: any = [];
  recordRTC: any = [];
  options: any = {};
  data: any[] = [];
  enableRecFlag: boolean;
  constraints: any = {}; 
  activityId: string;
  disabledFlag: boolean; 
  navigator: any = {};

  constructor(private route: Router, 
              private uploadRecordingService: UploadRecordingService,
              private routes: ActivatedRoute,
              private _sessionService: SessionService,
              private _loaderService: LoaderService) { }

  ngOnInit() {
    this.preview = document.getElementById("preview");
    this.recPreview = document.getElementById("recPreview");
    this.startButton = document.getElementById("startButton");
    this.stopButton = document.getElementById("stopButton");
    this.downloadButton = document.getElementById("downloadButton1"); 
    this.Retake = document.getElementById("Retake");
    this.Upload = document.getElementById("Upload");
    this.processing = document.getElementById("processing");
    this.start = document.getElementById("start");
    this.recordingTimeMS = uploadConstants.maxTime;
    this.recordedBlob;
    this.UploadData = [];
    this.next = document.getElementById("next");
    this.userId = "[[${id}]]";
    this.enableRecFlag = false;


    this.options = {
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 128000,
      ondataavailable: "",
      bitsPerSecond: 128000, // if this line is provided, skip above two
    };
    
     this.constraints = {
      video: {          
              width: 50,
              height: 50,                       
      },
      audio: true
  };

  this.routes.queryParams.subscribe((params: Params)=>{
    //alert(params['target']);
    this.activityId = params['activityId'];
  });
  
  this._sessionService.activityId.subscribe(activityId =>{
      this.activityId = activityId;
  });
  
    this.navigator = {
      mediaDevices: {} 
    }
  }

  async wait(delayInMS:any) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
  }

  async startRecording(stream:any, lengthInMS:any) {
    //this.recordRTC = RecordRTC(stream, this.options);
    this.enableRecFlag = true;
    this.recorder = new MediaRecorder(stream);
    let data1=this.data;
   
    this.recorder.ondataavailable = (event:any)=> data1.push(event.data);
    //this.recordRTC.ondataavailable = (event:any) => data.push(event.data);
    this.data=data1;
    this.recorder.start();
    //this.recordRTC.startRecording();
    console.log(this.recorder.state + " for " + (lengthInMS/uploadConstants.divideByThousand) + " seconds...");
    //console.log(this.recordRTC.state + " for " + (lengthInMS/1000) + " seconds...");
   
     }
  
  stopRec(stream:any) {
    //stream.getTracks().forEach((track:any) => track.stop());  //To stop camera recording
    let stopped = new Promise((resolve, reject) => {
      this.recorder.onstop = resolve;
      this.recorder.onerror = (event:any) => reject(event.name);
      //this.recordRTC.onstop = resolve;
      //this.recordRTC.onerror = (event:any) => reject(event.name);
      //return stopped;
      this.recorder.stop();
    });
    
    let recorded = this.wait(1).then(
      () => {this.recorder.state === "recording" && this.recorder.stop()
      //() => {
        //this.recordRTC.state == "recording" && this.recordRTC.stopRecording()
        //return recorded;
      }
    );
    
     Promise.all([
      stopped,
       recorded
     ])
     .then(() => {
       //this.data
      this.recordedBlob = new Blob(this.data, { type: "video/mp4" });
      this.UploadData=this.data;
      console.log("Successfully recorded " + this.recordedBlob.size + " bytes of " +
      this.recordedBlob.type + " media.");
      this.showScreen();

    });
      //this.recorder.stop()
          
  }
  
  startButtonClick(){
    this.enableRecFlag = true;
    setTimeout(() => {
      if(this.enableRecFlag){
        Swal.fire({
          title: 'Time Limit Exceeds?',
          text: 'Time Limit Exceeds. Please complete recording within 60 seconds.',
          icon: 'warning',          
          confirmButtonText: 'Retake',
          allowOutsideClick: false
        }).then((result) => {
          if (result.value) {
            this.recorder.stop();
            this.enableRecFlag = false;
            this.retake();
          }
        });        
      }
    }, this.recordingTimeMS);
    
    navigator.mediaDevices.getUserMedia(this.constraints).then(stream => {
    this.preview.srcObject = stream;      
    //this.preview.muted = true;      //to Mute Echoing audio
    this.preview.captureStream = this.preview.captureStream || this.preview.mozCaptureStream;
    //return new Promise(resolve => this.preview.onplaying = resolve);
  }).then(() => this.startRecording(this.preview.captureStream(), this.recordingTimeMS))
 .catch((error: any) => {
    // the info from the reject() is here
    alert(error);
  });
}

  stopButtonClick() {
      this.stopRec(this.preview.srcObject);
    /*  $("#start").fadeIn(2000);
      $("#start").fadeOut(2000); */    
  }

  show(){
    let contentDiv1 = document.getElementById("contentDiv1");
    let contentDiv2 = document.getElementById("contentDiv2");
    contentDiv1.style.display="none";
    contentDiv2.style.display="block";

  }

  showScreen(){
    let contentDiv1 = document.getElementById("contentDiv1");
    let contentDiv2 = document.getElementById("contentDiv2");
    let recVideo = document.getElementById("recVideo");
    let next = document.getElementById("next");
    contentDiv1.style.display="none";
    contentDiv2.style.display="none";
    recVideo.style.display = "none";
    next.style.display="block";
    this.recPreview.src = URL.createObjectURL(this.recordedBlob);
    this.enableRecFlag = false;  
  }

  uploadToS3(){
    //let name = (Math.ceil(Math.random() * 10));
    this._loaderService.display(true);
    this.disabledFlag = true;
    if(this.UploadData.size>0||this.recordedBlob.size>0){
      let file = new File([this.recordedBlob], this.activityId+".mp4");    
      console.log(file.name);
      
      let fd = new FormData();
      fd.append( "file", file );
      fd.append("activityId", this.activityId);      
      this.uploadRecordingService.uplaodVideoProposal(fd).subscribe(data => {
        this._loaderService.display(false);
        this.disabledFlag = false;
        let msg = "Recording uploaded successfully";        
        Swal.fire(msg);
        this.thankYou();  
      }, error => {
        console.log(error);
      });
      //this._loaderService.display(false);
    }
    else{
      Swal.fire({
        title: 'Error?',
        text: 'Something Went wrong..? Please record again.',
        icon: 'warning',          
        confirmButtonText: 'Retake',
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {          
          this.enableRecFlag = false;
            this.retake();
        }
      }); 
    }
  }

  thankYou(){
    this.route.navigate(['thanks']);
  }

  retake(){
    this.route.navigate(['app-instruction']);
  }
}
