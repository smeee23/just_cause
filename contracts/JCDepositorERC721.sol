// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JCDepositorERC721 is ERC721Enumerable, Ownable {

    struct Deposit {
        uint256 balance;
        uint256 totalDeposits;
        uint256 amountScaled;
        uint256 timeStamp;
        uint256 interestEarned;
        address pool;
        address asset;
    }
    //key = keccak hash of depositor, pool and asset addresses
    mapping (uint256 => Deposit) deposits;

    constructor() ERC721("JCP Depositor Token", "JCPT_TEST_D1") {

    }

    function addFunds(address _tokenOwner, uint256 _amount, uint256 _liquidityIndex, uint256 _timeStamp, address _pool, address _asset) onlyOwner public returns (uint256) {
        //_tokenIds.increment();
        //uint256 tokenId = _tokenIds.current();
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        if(_exists(tokenId)){
            deposits[tokenId].balance += _amount;
            deposits[tokenId].totalDeposits += _amount;
            deposits[tokenId].amountScaled += rayDiv(_amount, _liquidityIndex);
        }
        else{
            deposits[tokenId] = Deposit(_amount, _amount, rayDiv(_amount, _liquidityIndex), _timeStamp, _liquidityIndex, _pool, _asset);
            _mint(_tokenOwner, tokenId);
        }
        //_setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    //event Withdraw(uint256 amount, uint256 oldAmountScaled, uint256 newAmountScaled, uint256 oldLiquidityIndex, uint256 liquidityIndex);
    function withdrawFunds(address _tokenOwner, uint256 _amount, uint256 _liquidityIndex, address _pool, address _asset) onlyOwner
                        public returns (uint256, uint256, uint256, uint256, uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        require(_exists(tokenId), "tokenId doesn't exist");

        uint256 balance = deposits[tokenId].balance;
        require(balance >= _amount, "insufficient balance");
        balance -= _amount;
        /*if(balance == 0){
            //delete deposits[tokenId];
            //_burn(tokenId);
        }*/
        //_setTokenURI(tokenId, tokenURI);
        deposits[tokenId].balance = balance;
        uint256 oldAmountScaled = deposits[tokenId].amountScaled;
        deposits[tokenId].amountScaled -= rayDiv(_amount, _liquidityIndex);
        return(_amount, oldAmountScaled, deposits[tokenId].amountScaled , deposits[tokenId].liquidityIndex, _liquidityIndex);
    }

    function getDepositInfo(uint256 _tokenId) public view returns (Deposit memory){ //uint256 balace, uint256 totalDeposits, uint256 timeStamp, uint256 liquidityIndex, address pool, address asset) {
        return deposits[_tokenId];
    }

    function getATokenAmount(uint256 _tokenId, uint256 _reserveNormalizedIncome) external view returns(uint256){
        return rayMul(deposits[_tokenId].amountScaled, _reserveNormalizedIncome);
    }
    /**
   * @dev Divides two ray, rounding half up to the nearest ray
   * @param a Ray
   * @param b Ray
   * @return The result of a/b, in ray
   **/
    function rayDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, 'division by 0');
        uint256 halfB = b / 2;

        uint256 ray = 1e27;
        require(a <= (type(uint256).max - halfB) / ray, 'multiplication overflow');

        return (a * ray + halfB) / b;
    }

   /**
   * @dev Multiplies two ray, rounding half up to the nearest ray
   * @param a Ray
   * @param b Ray
   * @return The result of a*b, in ray
   **/
  function rayMul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0 || b == 0) {
      return 0;
    }

    uint256 ray = 1e27;
    uint256 halfRAY = ray / 2;
    require(a <= (type(uint256).max - halfRAY) / b, 'multiplication overflow');

    return (a * b + halfRAY) / ray;
  }
}