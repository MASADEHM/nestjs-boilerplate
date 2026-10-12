export interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
export interface StorageResult {
  file_name: string;
  file_path: string;
  is_public: boolean;
}

/**
 * Options for uploading a file to the storage
 * @param generateUniqueName - Whether to generate a unique name for the file
 * @param type - The type of file to upload , the file will be saved in the specific directory based on the type
 * @param isPublic - Whether the file is public or private, the file will be saved in the public directory if isPublic is true
 * type will override isPublic if both are provided
 */
export interface UploadOptions {
  generateUniqueName?: boolean;
  // when we need to replace the file will not send the type
  type?: FileUploadType;
  isPublic: boolean;
}

export interface StorageProvider {
  upload: (file: MulterFile, options?: UploadOptions) => Promise<StorageResult>;
  delete: (filePath: string, isPublic: boolean) => Promise<boolean>;
  getUrl: (filePath: string, isPublic: boolean) => string;
  getBuffer: (filePath: string, isPublic: boolean) => Promise<Buffer>;
  exists: (filePath: string, isPublic: boolean) => Promise<boolean>; // Check if file exists in storage
}

export enum StorageProviderType {
  LOCAL = 'local',
  AZURE_BLOB = 'azure_blob',
}

export enum FileUploadType {
  AVATAR = 'avatar',
  TENANCY_CONTRACT_ATTACHMENT = 'tenancy-contract-attachment',
  TENANCY_CONTRACT_CONTRACTS = 'tenancy-contract-contracts',
  MARINA_IMAGES = 'marina-images',
}

export interface AzureBlobConfig {
  connectionString: string;
  defaultContainer: string;
}
