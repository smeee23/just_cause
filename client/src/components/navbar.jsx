import React, { Component } from 'react';

//Stateless functional component
/*const NavBar = (props) => {
    return ( 
        <nav className="navbar navbar-light bg-light">
            <a className="navbar-brand" href="#">Navbar <span className="badge badge-pill badge-secondary"> {props.totalCounters}</span>
            </a>
        </nav> 
    );
}

const NavBar = ({totalCounters}) => {
    return ( 
        <nav className="navbar navbar-light bg-light">
            <a className="navbar-brand" href="#">Navbar <span className="badge badge-pill badge-secondary"> {props.totalCounters}</span>
            </a>
        </nav> 
    );
}*/

class NavBar extends Component {
    state = {  }
    render() {
        return ( 
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand" href="www.fakeurl.com">Navbar <span className="badge badge-pill badge-secondary"> {this.props.totalCounters}</span>
                </a>
            </nav> 
        );
    }
}
 
export default NavBar;