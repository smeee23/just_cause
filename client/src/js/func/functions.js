import getWeb3 from "../../getWeb3";
import JCPool from "../../contracts/JustCausePool.json";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";

export const getPoolInfo = async(poolTracker, activeAccount, web3) =>{
    let poolInfo = [];
    for(let i=0; i < poolTracker.length; i++){
        let JCPoolInstance = new web3.eth.Contract(
            JCPool.abi,
            poolTracker[i],
        );

        let acceptedTokens = await JCPoolInstance.methods.getAcceptedTokens().call();
        console.log("pool address:", JCPoolInstance.options.address)
        console.log("accepted tokens:", acceptedTokens);
        let totalDeposits = [];
        let activeUserBalance = [];
        for(let j = 0; j < acceptedTokens.length; j++){
            totalDeposits.push(await JCPoolInstance.methods.getTotalDeposits(acceptedTokens[j]).call());
            activeUserBalance.push(await JCPoolInstance.methods.getUserBalance(activeAccount, acceptedTokens[j]).call());
            console.log("total deposits for", acceptedTokens[j], " :", totalDeposits);
            console.log(activeAccount, "balance:", activeUserBalance);
        }

        poolInfo.push({
                        address: poolTracker[i],
                        acceptedTokens: acceptedTokens,
                        totalDeposits: totalDeposits,
                        activeUserBalance: activeUserBalance,
                        });
    }
    console.log("pool info 2", typeof poolInfo.values());
    console.log("pool tracker", poolTracker);
    return Array.from(poolInfo);
}