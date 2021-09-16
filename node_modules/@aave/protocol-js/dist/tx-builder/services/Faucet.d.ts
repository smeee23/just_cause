import { IFaucet, IMinter } from '../contract-types';
import FaucetInterface from '../interfaces/Faucet';
import { Configuration, EthereumTransactionTypeExtended, LendingPoolMarketConfig } from '../types';
import { FaucetParamsType } from '../types/FaucetMethodTypes';
import BaseService from './BaseService';
export default class FaucetService extends BaseService<IMinter> implements FaucetInterface {
    readonly faucetAddress: string;
    readonly faucetContract: IFaucet;
    readonly faucetConfig: LendingPoolMarketConfig | undefined;
    constructor(config: Configuration, faucetConfig: LendingPoolMarketConfig | undefined);
    mint({ userAddress, reserve, tokenSymbol }: FaucetParamsType): Promise<EthereumTransactionTypeExtended[]>;
}
