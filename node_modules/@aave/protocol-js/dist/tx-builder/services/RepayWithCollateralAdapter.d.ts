import { IRepayWithCollateral } from '../contract-types';
import RepayWithCollateralAdapterInterface from '../interfaces/RepayWithCollateralAdapter';
import { Configuration, EthereumTransactionTypeExtended, LendingPoolMarketConfig } from '../types';
import { RepayWithCollateralType } from '../types/RepayWithCollateralMethodTypes';
import BaseService from './BaseService';
export default class RepayWithCollateralAdapterService extends BaseService<IRepayWithCollateral> implements RepayWithCollateralAdapterInterface {
    readonly repayWithCollateralAddress: string;
    readonly repayWithCollateralConfig: LendingPoolMarketConfig | undefined;
    constructor(config: Configuration, repayWithCollateralConfig: LendingPoolMarketConfig | undefined);
    swapAndRepay({ user, collateralAsset, debtAsset, collateralAmount, debtRepayAmount, debtRateMode, permit, useEthPath, }: RepayWithCollateralType, txs?: EthereumTransactionTypeExtended[]): EthereumTransactionTypeExtended;
}
