import IERC20ServiceInterface from '../interfaces/ERC20';
import { ILendToAaveMigrator } from '../contract-types';
import LTAMigratorInterface from '../interfaces/LTAMigrator';
import { Configuration, EthereumTransactionTypeExtended, MigratorConfig, tEthereumAddress, tStringCurrencyUnits } from '../types';
import BaseService from './BaseService';
export default class LTAMigratorService extends BaseService<ILendToAaveMigrator> implements LTAMigratorInterface {
    readonly erc20Service: IERC20ServiceInterface;
    readonly migratorAddress: string;
    readonly migratorConfig: MigratorConfig | undefined;
    constructor(config: Configuration, erc20Service: IERC20ServiceInterface, migratorConfig: MigratorConfig | undefined);
    migrateLendToAave(user: tEthereumAddress, amount: tStringCurrencyUnits): Promise<EthereumTransactionTypeExtended[]>;
}
