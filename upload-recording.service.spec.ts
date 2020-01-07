import { TestBed } from '@angular/core/testing';

import { UploadRecordingService } from './upload-recording.service';

describe('UploadRecordingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadRecordingService = TestBed.get(UploadRecordingService);
    expect(service).toBeTruthy();
  });
});
