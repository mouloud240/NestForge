import { Inject, NotImplementedException } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UPLOAD_JOBS } from '../../../common/constants/jobs.js';
import { QUEUE_NAME } from '../../../common/constants/queues.js';
import type { IUploadService } from '../../upload/upload-service.interface.js';
import { UPLOAD_SERVICE } from '../../upload/upload.constants.js';
import { UploadJobDto } from './dto/upload-job.dto.js';

@Processor(QUEUE_NAME.UPLOAD)
export class UploadProcessor extends WorkerHost {
  constructor(
    @Inject(UPLOAD_SERVICE) private readonly uploadService: IUploadService,
  ) {
    super();
  }
  process(job: Job<UploadJobDto>): Promise<unknown> {
    switch (job.name) {
      case UPLOAD_JOBS.UPLOAD_FILE:
        return this.uploadService.upload(job.data.file, job.data.options);
      case UPLOAD_JOBS.DELETE_FILE:
        if (!this.uploadService.delete) {
          throw new NotImplementedException(
            'Current UPLOAD_SERVICE provider does not support delete.',
          );
        }
        return this.uploadService.delete(
          job.data.options.metadata?.id as string,
        );
      default:
        return Promise.resolve({
          message: 'Upload job processed',
          jobId: job.id,
        });
    }
  }
}
