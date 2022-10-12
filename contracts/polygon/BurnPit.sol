// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IOffsetHelper} from './interfaces/toucan/IOffsetHelper.sol';
import { IERC20} from './interfaces/other/IERC20.sol';
import { IWETH} from './interfaces/other/IWETH.sol';
import { SafeERC20 } from './libraries/SafeERC20.sol';
import { IUniswapV2Router02 } from './interfaces/uniswapv2/IUniswapV2Router02.sol';

contract BurnPit {
    using SafeERC20 for IERC20;

    // OffsetHelper addr 0x79E63048B355F4FBa192c5b28687B852a5521b31
    // USDC + WETH on matic
    address[] acceptedTokens = [0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174,
                                0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619,
                                0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270];

    address public sushiRouterAddress = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
    address public nctAddr = 0xD838290e877E0188a4A44700463419ED96c16107;

    event TokenBurned(
        uint256 balance,
        address poolToken,
        address[] tco2s,
        uint256[] amounts
    );

    event ETHBurned(
        address poolToken,
        address[] tco2s,
        uint256[] amounts
    );

    event NoBal(
        uint256 tokenBalance,
        address tokenAddr
    );

    event Test(
        address[] _acceptedTokens
    );

    function burnTokens(
        //address _poolToken
    ) public {
        if(address(this).balance > 0){
            swap(nctAddr);
        }
        address offsetHelperAddr = 0xFAFcCd01C395e4542BEed819De61f02f5562fAEa;
        address[] memory _acceptedTokens = acceptedTokens;
        for(uint8 i = 0; i < _acceptedTokens.length; i++){
            IERC20 token = IERC20(_acceptedTokens[i]);
            uint256 tokenBalance = token.balanceOf(address(this));
            if(tokenBalance > 0){
                swap(_acceptedTokens[i], nctAddr, tokenBalance);
            }
        }

        IERC20 nct = IERC20(nctAddr);
        uint256 nctBalance = nct.balanceOf(address(this));
        if(nctBalance > 0){
            address[] memory tco2s;
            uint256[] memory amounts;
            nct.safeApprove(offsetHelperAddr, 0);
            nct.safeApprove(offsetHelperAddr, nctBalance);
            (tco2s, amounts) = IOffsetHelper(offsetHelperAddr).autoOffsetUsingPoolToken(nctAddr, nctBalance);
            emit TokenBurned(nctBalance, nctAddr, tco2s, amounts);
        }
        else{
            emit NoBal(nctBalance, nctAddr);
        }
    }

    receive() external payable{}

    function generatePath(address _fromToken, address _toToken)
        internal
        view
        returns (address[] memory)
    {
        if (_fromToken == acceptedTokens[0]) {
            address[] memory path = new address[](2);
            path[0] = _fromToken;
            path[1] = _toToken;
            return path;
        } else {
            address[] memory path = new address[](3);
            path[0] = _fromToken;
            path[1] = acceptedTokens[0];
            path[2] = _toToken;
            return path;
        }
    }

    function swap(address _toToken) internal {
        uint256 balance = address(this).balance;

        // instantiate router
        IUniswapV2Router02 routerSushi = IUniswapV2Router02(sushiRouterAddress);

        // generate path
        address[] memory path = new address[](2);
        path[0] = address(routerSushi.WETH());
        path[1] = address(_toToken);

        // estimate amountsOut
        uint256[] memory expectedAmountsOut = routerSushi.getAmountsOut(
            balance,
            path
        );

        // swap
        routerSushi.swapExactETHForTokens{
            value: balance
        }(0, path, address(this), block.timestamp);
    }

    /**
     * @notice Swap eligible ERC20 tokens for NCT on SushiSwap
     * @dev Needs to be approved on the client side
     * @param _fromToken The ERC20 token to deposit and swap
     * @param _toToken The token to swap for (will be held within contract)
     * @param _amount The amount of _fromToken to be swapped
     */
    function swap(
        address _fromToken,
        address _toToken,
        uint256 _amount
    ) internal {
        // instantiate router
        IUniswapV2Router02 routerSushi = IUniswapV2Router02(sushiRouterAddress);

        // generate path
        address[] memory path = generatePath(_fromToken, _toToken);

        // estimate amountsOut
        uint256[] memory expectedAmountsOut = routerSushi.getAmountsOut(
            _amount,
            path
        );

        // approve router
        IERC20(_fromToken).approve(sushiRouterAddress, expectedAmountsOut[0]);

        // swap
        routerSushi.swapExactTokensForTokens(
            _amount,
            expectedAmountsOut[0],
            path,
            address(this),
            block.timestamp
        );
    }
}