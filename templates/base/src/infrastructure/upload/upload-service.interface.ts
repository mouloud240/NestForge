import { UploadFile } from './types/upload-file.type.js';
import { UploadOptions } from './types/upload-options.type.js';
import { UploadResult } from './types/upload-result.type.js';

export interface IUploadService {
  upload(file: UploadFile, options?: UploadOptions): Promise<UploadResult>;
  delete?(id: string): Promise<void>;
}
