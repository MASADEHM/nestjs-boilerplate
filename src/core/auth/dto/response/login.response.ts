import { BaseResponseTransformer } from '@core/shared/helpers';

export class AuthenticatedUserResponse extends BaseResponseTransformer {
  public id: number;
  public email: string;
  public full_name: string;
  public full_name_ar: string;
  public status: string;
}

export class LoginResponse {
  public accessToken: string;
  public user: AuthenticatedUserResponse;
}
