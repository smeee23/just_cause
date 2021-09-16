import React, { Component } from 'react';
import Counter from './counter.jsx';

class Counters extends Component {

    renderRoundNum() {
        if(parseInt(this.props.stageOfMatch) === 0 ) return;

        return  <h4>
                    <p style={{ fontSize: 30 }} >Round: {this.props.round}</p>
                </h4>;
    }

    renderStartRoundButton() {
        if(parseInt(this.props.stageOfMatch) !== 0 ) return;

        return <button
                    onClick={this.props.onStartRound} 
                    className="btn btn-primary btn-sm m-2"
                    style={{ fontSize: 40}}>
                        Start Round
                </button>;
    }

    renderJoinGameButton() {
        if(parseInt(this.props.stageOfMatch) !== 0 ) return;

        return <button
                    onClick={this.props.onAddPlayer} 
                    className="btn btn-primary btn-sm m-2"
                    style={{ fontSize: 40 }}>
                        Join Game
                </button>;
    }
    /*renderLeader() {
        if(parseInt(this.props.winners.length) === 0) return;
        const winIndex = this.props.winners[0];
        return  <h4>
                    <p style={{ fontSize: 30 }} >Leader: {winIndex} Point: {this.props.counters[winIndex]}</p>
                </h4>;
    }*/

    render() {
        // argument descructuring - allows to exclude this.props.onDelete to onDelete
        //const  {onReset, counters, onIncrement, onResetAll, onDelete} = this.props;
        return (
            <div>
                {this.renderJoinGameButton()}
                <button
                    onClick={this.props.onResetGame} 
                    className="btn btn-primary btn-sm m-2"
                    style={{ fontSize: 40 }}>
                        Reset Game
                </button>
                <p></p>
                {this.renderStartRoundButton()}
                <p></p>
                {this.renderRoundNum()}
                <p></p>

                {this.props.counters.map(counter => (
                    <Counter 
                        key={counter.id} 
                        selected={true}
                        stageOfMatch={this.props.stageOfMatch}
                        onWithdraw={this.props.onWithdraw}
                        onRoll={this.props.onRoll}
                        onAddBalance={this.props.onAddBalance}
                        onAddPlayer={this.props.onAdd}
                        onFirstBet={this.props.onFirstBet}
                        onCall={this.props.onCall}
                        counter={counter}
                    >
                            <h4 style={{ fontSize: 40 }} >Player # {counter.id}</h4>
                    </Counter>
                ))}
            </div> 
        );
    }
}
 
export default Counters;