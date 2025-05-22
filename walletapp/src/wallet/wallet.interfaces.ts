export interface IWallet{
    _id?:string;
    account?: any;
    balance?: number;
    priorBalance?:number;
    walletAccountNo?:string;
    currency?: string;
    currencySymbol?:string;
    currencyStorageUnitSymbol?: "naira" | "kobo";
    createdAt?: Date;
    __v?: number;
  }