export default interface IRequest {
  body: any;
  user?: any;
  headers?: any;
  params?: any;
  file?: any;
  files?: any;
  query?: any;
}
