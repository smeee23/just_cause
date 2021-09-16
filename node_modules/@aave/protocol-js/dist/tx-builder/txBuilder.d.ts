import { providers } from 'ethers';
import FaucetInterface from './interfaces/Faucet';
import IERC20ServiceInterface from './interfaces/ERC20';
import LTAMigratorInterface from './interfaces/LTAMigrator';
import StakingInterface from './interfaces/Staking';
import SynthetixInterface from './interfaces/Synthetix';
import { Configuration, DefaultProviderKeys, Network, TxBuilderConfig } from './types';
import { IncentivesControllerInterface } from './services/IncentivesController';
export default class BaseTxBuilder {
    readonly configuration: Configuration;
    erc20Service: IERC20ServiceInterface;
    synthetixService: SynthetixInterface;
    ltaMigratorService: LTAMigratorInterface;
    incentiveService: IncentivesControllerInterface;
    readonly stakings: {
        [stake: string]: StakingInterface;
    };
    readonly faucets: {
        [market: string]: FaucetInterface;
    };
    readonly txBuilderConfig: TxBuilderConfig;
    constructor(network?: Network, injectedProvider?: providers.Provider | string | undefined, defaultProviderKeys?: DefaultProviderKeys, config?: TxBuilderConfig);
    getFaucet: (market: string) => FaucetInterface;
    getStaking: (stake: string) => StakingInterface;
}
