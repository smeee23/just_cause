import React, { Component } from "react";
import CeeLow from "./contracts/CeeLow.json";
import RandomNumberConsumer from "./contracts/RandomNumberConsumer.json";
import getWeb3 from "./getWeb3";
import Counters from './components/counters';
import NavBar from "./components/navbar";

import "./App.css";

class App extends Component {

  state = {
    loaded: false, 
    address: null,
    randomAddress: null, 
    contractTokens: 0,
    betPool: 0,
    roundBetSize: 0,
    // stage of match 0 = between game, 1 = wait for first bet, 2 = wait for calls, 3 = in game, 4 = end game
    stageOfMatch: 0,
    counters: [],
    winners: [],
    round: 1,
    randomButtonPhrase: "Use Chainlink Random",
    numClicks: 0,
  };

  constructor (props) {
    super(props);
    console.log('App - contructor', this.props);
    //this.state = this.props.something; not this.setState...
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.CeeLowInstance = new this.web3.eth.Contract(
        CeeLow.abi,
        CeeLow.networks[this.networkId] && CeeLow.networks[this.networkId].address,
      );

      this.RandomNumberConsumerInstance = new this.web3.eth.Contract(
        RandomNumberConsumer.abi,
        RandomNumberConsumer.networks[this.networkId] && RandomNumberConsumer.networks[this.networkId].address,
      );

      //load player list and other states from local storage
      const loadedCounters = JSON.parse(localStorage.getItem('counters') || "[]");
      const loadedWinners = JSON.parse(localStorage.getItem('winners') || "[]");
      console.log('bbbbbbbbbbb', typeof loadedCounters, loadedCounters);
      console.log('loaded Winners', typeof loadedWinners, loadedWinners);


      const loadedRandomButtonPhrase = localStorage.getItem("randomButtonPhrase");
      if(loadedRandomButtonPhrase){
        this.setState({randomButtonPhrase: loadedRandomButtonPhrase});
      }
      const loadedNumClicks = Number(localStorage.getItem('numClicks'));
      if(loadedNumClicks){
        this.setState({numClicks: loadedNumClicks});
      }
      const loadedRoundBalance = Number(localStorage.getItem('betPool'));
      if(loadedRoundBalance){
        this.setState({betPool: loadedRoundBalance});
      }
      const loadedContractTokens = Number(localStorage.getItem('contractTokens'));
      if(loadedContractTokens){
        this.setState({contractTokens: loadedContractTokens});
      }
      const loadedRoundBetSize = Number(localStorage.getItem('roundBetSize'));
      if(loadedRoundBetSize){
        this.setState({roundBetSize: loadedRoundBetSize});
      }
      const loadedStageOfMatch = Number(localStorage.getItem('stageOfMatch'));
      if(loadedStageOfMatch){
        this.setState({stageOfMatch: loadedStageOfMatch});
      }
      const loadedRound = Number(localStorage.getItem('round'));
      if(loadedRound){
        this.setState({round: loadedRound});
      }

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
                      loaded:true, contractAddress: CeeLow.networks[this.networkId].address, 
                      randomAddress: RandomNumberConsumer.networks[this.networkId].address,
                      counters: loadedCounters, winners: loadedWinners});

      console.log('App - mounted');
    } 
    catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

 createPlayerComponent = (player) => {
    const playerComponent = {
                              id: player.playerId, 
                              tags: [
                                      'address: '+player.addr, 
                                      'scores: '+player.score,
                                      'current score: '+player.currentScore,
                                      'balance: '+player.balance, 
                                      'bet this round: '+player.betThisRound, 
                                      'wins: '+player.wins, 
                                      'turn: '+player.isTurn,
                                      'has rolled: '+player.hasRolled, 
                                      'first roll: '+ player.isFirstRoll, 
                                      'wait for call: '+player.isWaitForCall,
                                      'wait for bet: '+player.isWaitForBet,
                                      'in game: '+player.inGame
                                    ], 
                              address: player.addr, 
                              balance: player.balance,
                              betThisRound: player.betThisRound,
                              inGame: player.inGame,
                              isTurn: player.isTurn,
                              isFirstRoll: player.isFirstRoll,
                              isWaitForCall: player.isWaitForCall,
                              isWaitForBet: player.isWaitForBet,
                              score: player.score,
                              wins: player.wins,
                            };
    return playerComponent;
 };

 handleAddPlayer = async(counter) => {
    console.log('Add Player Event Handler Called ', counter);
    const deposit = this.web3.utils.toWei("10", "gwei");
    const activeAccount = this.web3.currentProvider.selectedAddress;
    let result = await this.CeeLowInstance.methods.addPlayer(activeAccount, deposit).send({from: activeAccount, value: deposit});
    const contractBalance = result.events.ContractBalance.returnValues.balance;
    const players = result.events.Players.returnValues.players;
    const player = players[players.length - 1];
    alert("New Player Has Joined: "+ player.addr);

    const playerComponent = this.createPlayerComponent(player);
    const updatedCounters = this.state.counters.concat(playerComponent);

    console.log("contract copy", result.events.Players.returnValues.players);
    console.log("react copy", updatedCounters);
    
    this.setState({counters: updatedCounters, contractTokens: contractBalance})
    localStorage.setItem('counters', JSON.stringify(updatedCounters));
    localStorage.setItem('contractTokens', contractBalance);
 };

 handleResetGame = async() => {
    console.log('Reset Game Event Handler Called');
    const activeAccount = this.web3.currentProvider.selectedAddress;
    const result = await this.CeeLowInstance.methods.resetGame().send({from: activeAccount});
    const players = result.events.Players.returnValues.players;
    console.log('dddd', players);    
    
    this.setState({
                    counters: [], winners: [], contractTokens: 0, 
                    betPool: 0, roundBetSize: 0, stageOfMatch: 0, round: 1, 
                    randomButtonPhrase: "Use Chainlink Random", numClicks: 0
                  });
    localStorage.setItem('counters', JSON.stringify([]));
    localStorage.setItem('winners', JSON.stringify([]));
    localStorage.setItem('contractTokens', 0);
    localStorage.setItem('betPool', 0);
    localStorage.setItem('roundBetSize', 0);
    localStorage.setItem('stageOfMatch', 0);
    localStorage.setItem('round', 1);
    localStorage.setItem('randomButtonPhrase', "Use Chainlink Random");
    localStorage.setItem('numClicks', 0);
    alert("Game reset called, refunding balances");
 };

 handleAddBalance = async(counterId) =>{
    console.log('Add Balance Event Handler Called ', counterId, this.state.counters);
    const activeAccount = this.web3.currentProvider.selectedAddress;

    const counter = this.state.counters.filter(c => c.id === counterId)[0];
    const index = this.state.counters.indexOf(counter);

    if(activeAccount === counter.address.toLowerCase()){
      const deposit = this.web3.utils.toWei("1", "gwei");
      let result = await this.CeeLowInstance.methods.addToBalance(index).send({from: activeAccount, value: deposit});
      const contractBalance = result.events.ContractBalance.returnValues.balance;
      const players = result.events.Players.returnValues.players;
      const player = players[index];
      alert("Player "+ player.addr +" Has Added "+ deposit +" To Balance");

      const playerComponent = this.createPlayerComponent(player);
      let updatedCounters = this.state.counters;
      updatedCounters[index] = playerComponent;

      console.log("contract copy", result.events.Players.returnValues.players);
      console.log("react copy", updatedCounters);
      
      this.setState({counters: updatedCounters, contractTokens: contractBalance})
      localStorage.setItem('counters', JSON.stringify(updatedCounters));
      localStorage.setItem('contractTokens', contractBalance);
    }
    else{
      alert("You may only withdraw your player's wallet");
    }
 };
 handleWithdraw = async(counterId) => {
    console.log('Withdraw Event Handler Called ', counterId, this.state.counters);
    const activeAccount = this.web3.currentProvider.selectedAddress;

    const counter = this.state.counters.filter(c => c.id === counterId)[0];
    const index = this.state.counters.indexOf(counter);
    console.log("aaaaaaa", counter, index);

    if(activeAccount === counter.address.toLowerCase()){
      let result = await this.CeeLowInstance.methods.withdrawPlayer(index).send({from: activeAccount})
      const contractBalance = result.events.ContractBalance.returnValues.balance;     
      const updatedCounters = this.state.counters.filter(c => c.id !== counterId);

      console.log("contract copy", result.events.Players.returnValues.players);
      console.log("react copy", updatedCounters);

      this.setState({counters: updatedCounters, contractTokens: contractBalance})
      localStorage.setItem('counters', JSON.stringify(updatedCounters));
      localStorage.setItem('contractTokens', contractBalance); 
    }
    else{
       alert("You may only withdraw your player's wallet");
    }
 };

 handleStartRound = async() => {
    const activeAccount = this.web3.currentProvider.selectedAddress;
    let result = await this.CeeLowInstance.methods.startRound().send({from: activeAccount});
    const turn = result.events.Turn.returnValues.turn;

    const players = result.events.Players.returnValues.players;
    
    const player = players[turn];
    const playerComponent = this.createPlayerComponent(player);
    let updatedCounters = this.state.counters;
    updatedCounters[turn] = playerComponent;

    const stageOfMatch = result.events.StageOfMatch.returnValues.stageOfMatch;
    console.log("contract copy", result.events.Players.returnValues.players);
    console.log("react copy", updatedCounters);
    
    this.setState({counters: updatedCounters, stageOfMatch})
    localStorage.setItem('counters', JSON.stringify(updatedCounters));
    localStorage.setItem('stageOfMatch', stageOfMatch);
    alert("Round Started");
 };

 handleCall = async(counterId) => {
    const betSize = this.state.roundBetSize;
    const activeAccount = this.web3.currentProvider.selectedAddress;

    const counter = this.state.counters.filter(c => c.id === counterId)[0];
    const index = this.state.counters.indexOf(counter);

    if(activeAccount === counter.address.toLowerCase()){
      console.log('call bet', index, betSize, (typeof betSize))
      let result = await this.CeeLowInstance.methods.callBet(index, betSize).send({from: activeAccount});

      const players = result.events.Players.returnValues.players;
      const player = players[index];
      const playerComponent = this.createPlayerComponent(player);
      let updatedCounters = this.state.counters;
      updatedCounters[index] = playerComponent;

      const updatedStageOfMatch = result.events.StageOfMatch.returnValues.stageOfMatch;
      const updatedBetPool = result.events.BetPool.returnValues.betPool;
      console.log("contract copy", result.events.Players.returnValues.players);
      console.log("react copy", updatedCounters);
      console.log("stageOfMatch", updatedStageOfMatch);

      this.setState({counters: updatedCounters, stageOfMatch: updatedStageOfMatch, betPool: updatedBetPool})
      localStorage.setItem('counters', JSON.stringify(updatedCounters));
      localStorage.setItem('stageOfMatch', updatedStageOfMatch);
      localStorage.setItem('betPool', updatedBetPool);
      if (updatedStageOfMatch === 3){
        console.log('stage of match', updatedStageOfMatch);
      }
    }
    else{
      alert("must be the wallet owner to call bet");
    }
 };

 getRandomInt = (max) => {
  return Math.floor(Math.random() * max) + 1;
 };

 getRandomRolls = async(numRolls, activeAccount) => {
    let rolls = [];
    const randomChooser = this.state.randomButtonPhrase;

    if(randomChooser === "Use Chainlink Random"){
      for(let i = 0; i < numRolls; i++){
        const die1 = this.getRandomInt(5);
        const die2 = this.getRandomInt(5);
        const die3 = this.getRandomInt(5);
        rolls.push([die1, die2, die3]);
      }
    }
    else{
      //use chainlink contract for random numbers
      numRolls = numRolls*3; 
      const result = await this.RandomNumberConsumerInstance.methods.getRandomNumber(this.getRandomInt(5), numRolls).send({from: activeAccount});
      console.log('random', result.events.RandomArray.returnValues.values);
      const randomArray = result.events.RandomArray.returnValues.values;
      alert("call chainlink contract");
      for(let i = 0; i < numRolls; i+=3){
        const die1 = Number(randomArray[i]); 
        const die2 = Number(randomArray[i+1]);
        const die3 = Number(randomArray[i+2]);
        rolls.push([die1, die2, die3]);
      }
    }
    return rolls;
 };

 getRandomFromChainlinkVrf = async(numRolls, activeAccount) => {
   const result = await this.RandomNumberConsumerInstance.methods.getRandomNumber(this.getRandomInt(5), numRolls).send({from: activeAccount});
   console.log('random', result.events.RandomArray.returnValues.values);
   return  result.events.RandomArray.returnValues.values;
 }

 handleRandomChooser = () => {
   let numClicks = this.state.numClicks + 1;
   this.setState({numClicks});
   localStorage.setItem("numClicks", numClicks);
   let jsPhrase = "Use JS Random";
   let linkPhrase = "Use Chainlink Random";
   if(numClicks % 2 !== 0){
    this.setState({randomButtonPhrase: jsPhrase});
    localStorage.setItem("randomButtonPhrase", jsPhrase);
   }
   else{
    this.setState({randomButtonPhrase: linkPhrase});
    localStorage.setItem("randomButtonPhrase", linkPhrase);
   }
 }

 handleRoll = async(counterId) => {
  const activeAccount = this.web3.currentProvider.selectedAddress;

  const counter = this.state.counters.filter(c => c.id === counterId)[0];
  const index = this.state.counters.indexOf(counter);

  if(activeAccount === counter.address.toLowerCase()){
    const rolls = await this.getRandomRolls(25, activeAccount);
    console.log('aaaaaaa', rolls);
    let result = await this.CeeLowInstance.methods.roll(index, rolls).send({from: activeAccount});

    console.log('aaaaaaa', result.events);

    const players = result.events.Players.returnValues.players;
    let updatedCounters = this.state.counters;
    for(let i = 0; i < players.length; i++){
      const player = players[i];
      const playerComponent = this.createPlayerComponent(player);
      updatedCounters[i] = playerComponent;
    }

    const leaders = result.events.Winners.returnValues.winners;

    console.log('winners', leaders);

    const round = result.events.Round.returnValues.round
    const stageOfMatch = result.events.StageOfMatch.returnValues.stageOfMatch;
    const allRolled = result.events.AllRolled.returnValues.allRolled;
    const scores = result.events.Scores.returnValues;

    console.log("contract copy", result.events.Players.returnValues.players);
    console.log("react copy", (typeof updatedCounters), updatedCounters); 
    //console.log("winners", winners.length);
    //console.log("react copy winners", (typeof updatedLeaders), updatedLeaders);
    console.log("round", round);
    console.log("high score", result.events.HighScore.returnValues.currentHighScore);
    console.log('events', result.events);

    this.setState({counters: updatedCounters, stageOfMatch, round, winners: leaders});
    localStorage.setItem('counters', JSON.stringify(updatedCounters));
    localStorage.setItem('winners', JSON.stringify(leaders));
    localStorage.setItem('round', round);
    localStorage.setItem('stageOfMatch', stageOfMatch);

    alert('player '+counterId+' rolled '+scores.currentScore);

    if(allRolled){
      console.log('all rolled, leaders.length', allRolled, leaders.length);
      if(leaders.length === 1){
        alert("match over player "+String(players[leaders[0]].playerId)+" wins");
      }
      else if(leaders.length > 1){
        alert("tie point, move on to round "+String(round));
      }
    }
  }
  else{
    alert("must be the wallet owner to roll the die");
  }
 };

 handleFirstBet = async(counterId, size) => {
    const activeAccount = this.web3.currentProvider.selectedAddress;
    const bet = this.web3.utils.toWei("1", "gwei") * parseInt(size);
    //const turn = result.events.Turn.returnValues.turn;
    const counter = this.state.counters.filter(c => c.id === counterId)[0];
    console.log('bet', bet, (typeof bet));
    if(activeAccount === counter.address.toLowerCase()){
      let result = await this.CeeLowInstance.methods.takeFirstBet(bet).send({from: activeAccount});
      const players = result.events.Players.returnValues.players;
      
      let updatedCounters = this.state.counters;
      for(let i = 0; i < players.length; i++){

        const player = players[i];
        const playerComponent = this.createPlayerComponent(player);
        updatedCounters[i] = playerComponent;
      }
      
      const stageOfMatch = result.events.StageOfMatch.returnValues.stageOfMatch;

      console.log("contract copy", result.events.Players.returnValues.players);
      console.log("react copy", updatedCounters);

      this.setState({counters: updatedCounters, betPool: bet*size, roundBetSize: bet*size, stageOfMatch})
      localStorage.setItem('counters', JSON.stringify(updatedCounters));
      localStorage.setItem('betPool', bet*size);
      localStorage.setItem('roundBetSize', bet*size);
      localStorage.setItem('roundBetSize', stageOfMatch);

      alert("First Bet Placed");
    }
    else{
      alert("Only first to roll can place initial bet");
    }
 };

 handleEnd = () => {
    const counters = this.state.counters.map(c => {
        c.value = 0;
        return c;
    });
    this.setState({ counters });
 };

 render() {
    return (
      <React.Fragment>
        <NavBar 
          totalCounters={this.state.counters.filter(c => c.value > 0).length}
        />
        <main className="container">
          <h1>Cee-Lo</h1>
          <p style={{ fontSize: 20 }} >to buy into game send tokens to: {this.state.contractAddress}</p>
          <p style={{ fontSize: 20 }} >chainlink random number generator address: {this.state.randomAddress}</p>
          <p style={{ fontSize: 20 }} >contract currently has {this.state.contractTokens}</p>
          <p style={{ fontSize: 20 }} >Tokens at stake in current round: {this.state.betPool} </p>
          <p style={{ fontSize: 20 }} >stage of match: {this.state.stageOfMatch} </p>

          <button
              onClick={this.handleRandomChooser} 
              className="btn btn-primary btn-sm m-2"
              style={{ fontSize: 40 }}>
                  Random Chooser {this.state.numClicks} {this.state.randomButtonPhrase}
          </button>

          <Counters
            counters={this.state.counters}
            stageOfMatch={this.state.stageOfMatch}
            round={this.state.round} 
            onAddPlayer={this.handleAddPlayer}
            onResetGame={this.handleResetGame}
            onStartRound={this.handleStartRound} 
            onRoll={this.handleRoll}
            onWithdraw={this.handleWithdraw}
            onAddBalance={this.handleAddBalance}
            onFirstBet={this.handleFirstBet}
            onEndGame={this.handleEndGame}
            onCall={this.handleCall}
          />
        </main>
      </React.Fragment>
    );
  }
}

export default App;