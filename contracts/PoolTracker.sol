// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.9;

contract PoolTracker {

    //contract addresses will point to bool if they exist
    mapping(address => bool) private isPool;
    mapping(address => address[]) private depositors;
    mapping(address => address[]) private owners;
    mapping(string => address) private names;
    address[] private verifiedPools;

    event AddVerifiedPools(address addressToAdd);
    event AddDeposit(address _userAddr, address _pool);
    event WithdrawDeposit(address _userAddr, address _pool);
    event OwnerAddress(address _owner, address _pool);

    event MessageSentBy(address sentBy);

    modifier onlyPools(address _pool){
        require(isPool[_pool], "this function must be called from a pool");
        _;
    }

    function addDeposit(address _userAddr, address _pool) onlyPools(msg.sender) external {
        depositors[_userAddr].push(_pool);
        emit AddDeposit(_userAddr, _pool);
        emit MessageSentBy(msg.sender);
    }

    function withdrawDeposit(address _userAddr, address _pool) onlyPools(msg.sender) external {
        for(uint8 i = 0; i < depositors[_userAddr].length -1; i++){
            if(depositors[_userAddr][i] == _pool){
                depositors[_userAddr][i] = depositors[_userAddr][depositors[_userAddr].length - 1];
                break;
            }
        }
        depositors[_userAddr].pop();
        emit WithdrawDeposit(_userAddr, _pool);
        emit MessageSentBy(msg.sender);
    }

    function addVerifiedPools(address _pool, address _owner, string memory _name) external {
        //require(names[_name] == address(0), "pool with name already exists");
        names[_name] =  _pool;
        verifiedPools.push( _pool);
        owners[_owner].push( _pool);
        isPool[_pool] = true;
        //emit AddVerifiedPools(_pool);
        //emit MessageSentBy(msg.sender);
    }

    function getVerifiedPools() public view returns(address [] memory){
        return verifiedPools;
    }

    function getUserDeposits(address _userAddr) external view returns(address[] memory){
        return depositors[_userAddr];
    }

    function getUserOwned(address _userAddr) external view returns(address[] memory){
        return owners[_userAddr];
    }

    function getAddressFromName(string memory name) external view returns(address){
        return address(this);//names[name];
    }
}