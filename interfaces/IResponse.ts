export default interface IResponse {
  status: (code: number) => IResponse;
  json: (data: any) => IResponse;
}
