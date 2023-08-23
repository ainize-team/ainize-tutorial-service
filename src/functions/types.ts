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
  CUSTOM = 'CUSTOM',
}
export { ainizeInitalConfig, responseStatus, historyType, ActionType };