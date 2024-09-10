export class BlitzWareAuthConfig {
  constructor(
    public responseType: 'code' | 'token' = 'token',
    public clientId: string,
    public redirectUri: string
  ) {}
}
