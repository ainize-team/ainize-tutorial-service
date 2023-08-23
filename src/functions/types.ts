type ainizeInitalConfig = {
  appName: string,
  userPrivateKey:string,
}
enum responseStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT= 'TIMEOUT',
}
enum historyType {
  DEPOSIT = 'DEPOSIT',
  USAGE = 'USAGE',
}
enum ActionType {
  SERVICE = 'SERVICE',
  DEPOSIT = 'DEPOSIT',
}
export { ainizeInitalConfig, responseStatus, historyType, ActionType };