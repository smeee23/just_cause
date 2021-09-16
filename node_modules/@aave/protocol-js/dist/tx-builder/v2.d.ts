import { providers } from 'ethers';
import { Network, DefaultProviderKeys, TxBuilderConfig } from './types';
import TxBuilderInterface from './interfaces/TxBuilder';
import LendingPoolInterface from './interfaces/v2/LendingPool';
import BaseTxBuilder from './txBuilder';
import WETHGatewayInterface from './interfaces/WETHGateway';
import BaseDebtTokenInterface from './interfaces/BaseDebtToken';
import LiquiditySwapAdapterInterface from './interfaces/LiquiditySwapAdapterParaswap';
import RepayWithCollateralAdapterInterface from './interfaces/RepayWithCollateralAdapter';
import AaveGovernanceV2Interface from './interfaces/v2/AaveGovernanceV2';
import GovernanceDelegationTokenInterface from './interfaces/v2/GovernanceDelegationToken';
export default class TxBuilder extends BaseTxBuilder implements TxBuilderInterface {
    readonly lendingPools: {
        [market: string]: LendingPoolInterface;
    };
    readonly wethGateways: {
        [market: string]: WETHGatewayInterface;
    };
    readonly swapCollateralAdapters: {
        [market: string]: LiquiditySwapAdapterInterface;
    };
    readonly repayWithCollateralAdapters: {
        [market: string]: RepayWithCollateralAdapterInterface;
    };
    readonly baseDebtTokenService: BaseDebtTokenInterface;
    aaveGovernanceV2Service: AaveGovernanceV2Interface;
    governanceDelegationTokenService: GovernanceDelegationTokenInterface;
    constructor(network?: Network, injectedProvider?: providers.Provider | string | undefined, defaultProviderKeys?: DefaultProviderKeys, config?: TxBuilderConfig);
    getRepayWithCollateralAdapter: (market: string) => RepayWithCollateralAdapterInterface;
    getSwapCollateralAdapter: (market: string) => LiquiditySwapAdapterInterface;
    getWethGateway: (market: string) => WETHGatewayInterface;
    getLendingPool: (market: string) => LendingPoolInterface;
}
