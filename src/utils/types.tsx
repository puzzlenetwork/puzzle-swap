interface IPayment {
  amount: number;
  assetId: null | string;
};

interface ITransfer {
  address: string;
  asset: string;
  amount: number;
}

interface ILeased {
  id: string;
  originTransactionId: string;
  sender: string;
  recipient: string;
  amount: number;
  height: number;
  status: string;
  cancelHeight: number;
  cancelTransactionId: string;
}

interface IInvoked extends IBaseTransaction {
  call: {
    function: string;
    args: [
      {
        type: string;
        value: number;
      }
    ];
  };
}


interface ITransactionStateChanges {
  data: [
    {
      key: string;
      type: string;
      value: number;
    },
  ];
  transfers: ITransfer[];
  issues: [];
  reissues: [];
  burns: [];
  sponsorFees: [];
  leases: ILeased[];
  leaseCancels: ILeased[];
  invokes: IInvoked[];
};

interface IBaseTransaction {
  height: number;
  id: string;
  dApp: string;
  payment: IPayment[];
  stateChanges: ITransactionStateChanges;
};

export interface ITransaction extends IBaseTransaction {
  type: number;
  sender: string;
  senderPublicKey: string;
  fee: number;
  feeAssetId: null;
  timestamp: number;
  proofs: string[];
  version: number;
  call: {
    function: string;
    args: [
      {
        type: string;
        value: string;
      },
      {
        type: string;
        value: number;
      }
    ];
  };
  applicationStatus: string;
  spentComplexity: number;
}

export interface IEvaluateScript {
  result: {
    type: string;
    value: Record<
      string,
      {
        type: string;
        value: string | number | boolean | [];
      }
    >;
  };
  complexity: number;
  expr: string;
  address: string;
}

export interface IHistory {
  claimed: number;
  liquidity: number;
  lpamount: number;
  owner_fees: number;
  pool_fees: number;
  pool_token_price: number;
  protocol_fees: number;
  time: number;
  volume: number;
}