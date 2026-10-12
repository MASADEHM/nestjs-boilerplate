import {
  AzureBlobStorageProvider,
  LocalStorageProvider,
} from '@core/files/providers';
import { StorageProvider, StorageProviderType } from '@core/files/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly azureBlobStorageProvider: AzureBlobStorageProvider
  ) {}

  public getProvider(providerType?: StorageProviderType): StorageProvider {
    const provider = providerType ?? this.getDefaultProvider();

    switch (provider) {
      case StorageProviderType.AZURE_BLOB:
        return this.azureBlobStorageProvider;
      case StorageProviderType.LOCAL:
        return this.localStorageProvider;
      default:
        return this.localStorageProvider;
    }
  }

  private getDefaultProvider(): StorageProviderType {
    const defaultProvider = this.configService.get<string>(
      'DEFAULT_STORAGE_PROVIDER'
    );
    if (defaultProvider == null) {
      return StorageProviderType.LOCAL;
    }
    return defaultProvider as StorageProviderType;
  }
}
