import React, { Component } from 'react';

class Counter extends Component {
    state = {
        //imageUrl: 'https://picsum.photos/200',
    };

    componentDidUpdate(prevProps, prevState){
        if (prevProps.counter.value !== this.props.counter.value){
            //could make an Ajax call to the server
        }
    }

    componentWillUnmount(){
    }
    /*constructor(){
        super();
        this.handleIncrement = this.handleIncrement.bind(this);
        this.formatCount = this.formatCount.bind(this);
    }*/
    

    styles = {
        fontSize: 20,
        fontWeight: "bold",
        color: "black"
    };

    renderTags(){
        if (this.props.counter.tags.length === 0) return <p>There are no tags!</p>;
        return <ul>{this.props.counter.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>;
    };

    renderFirstRollButton(){
        if (!this.props.counter.isFirstRoll) return;
        if(!this.props.counter.isWaitForBet) return;
        
        return  <h1>First Bet
                <button 
                    onClick={() => this.props.onFirstBet(this.props.counter.id, 1)} 
                    style={{ fontSize: 30 }} className="btn btn-secondary btn-sm m-2">
                    1X
                </button>
                <button 
                    onClick={() => this.props.onFirstBet(this.props.counter.id, 2)} 
                    style={{ fontSize: 30 }} className="btn btn-secondary btn-sm m-2">
                    2X
                </button>
                <button 
                    onClick={() => this.props.onFirstBet(this.props.counter.id, 3)} 
                    style={{ fontSize: 30 }} className="btn btn-secondary btn-sm m-2">
                    3X
                </button>
                </h1>;
    }
    renderWaitForCallButton(){
        console.log('wait for call button rendered', this.props.stageOfMatch, this.props.counter.isWaitForCall);
        if(parseInt(this.props.stageOfMatch) !== 2) return;
        if (!this.props.counter.isWaitForCall) return;

        return  <h1>
                <button 
                    onClick={() => this.props.onCall(this.props.counter.id)} 
                    style={{ fontSize: 30 }} className="btn btn-secondary btn-sm m-2">
                    Call
                </button>
                </h1>;
    }

    renderRollButton(){
        if(parseInt(this.props.stageOfMatch) !== 3) return;
        if(!this.props.counter.isTurn) return;

        return  <button 
                    onClick={() => this.props.onRoll(this.props.counter.id)} 
                    style={{ fontSize: 30 }} className="btn btn-secondary btn-sm">
                        Roll
                </button>;
    }
    /* changes local state, not ideal for value because it is 
    updated in the parent class (counters) as well as this class*/

    /*handleIncrement = product => {
        //console.log(product);
        this.setState({value: this.state.value + 1});
        //console.log('Increment Clicked', this.state.value, this);
    };

    handleReset = product => {
        //console.log(product);
        this.setState({value: 0});
        //console.log('Increment Clicked', this.state.value, this);
    };*/

    render() {
        //console.log('props', this.props);
        return (<React.Fragment>
                   {this.props.children}
                   {this.renderFirstRollButton()}
                   {this.renderWaitForCallButton()}
                   {this.renderRollButton()}
                   <button 
                     onClick={() => this.props.onAddBalance(this.props.counter.id)} 
                     style={{ fontSize: 30 }} className="btn btn-secondary btn-sm m-2">
                         Add Balance
                   </button>
                   <button 
                     onClick={() => this.props.onWithdraw(this.props.counter.id)} 
                     style={{ fontSize: 30 }} className="btn btn-danger btn-sm m-2">
                         Withdraw
                   </button>

                   {this.props.counter.tags.length === 0 && 'Please create a new tag'}
                   {this.renderTags()}
                </React.Fragment>);
                /*return (<body style= {{backgroundImage: 'linear-gradient(#fdeaba 0%, #f4a2a2 15%, #f7a196 85%, #fdeaba 100%)'}}>
                
                         </body>);*/
                
    };

    /*
    <span style={this.styles} className={this.getBadgeClasses()}>{this.formatCount()}</span>
    getBadgeClasses() {
        let classes = "badge m-5";
        classes += (this.props.counter.value === 0) ? "badge-warning" : "badge-primary";
        return classes;
    };

    formatCount = () =>{
        let { value: count } = this.props.counter;
        return count === 0 ? 'Zero' : count;
    };
    */
}
 
export default Counter;