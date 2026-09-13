import { UploadFile } from '../../../upload/types/upload-file.type.js';
import { UploadOptions } from '../../../upload/types/upload-options.type.js';

export class UploadJobDto {
  file: UploadFile;
  options: UploadOptions;
}
