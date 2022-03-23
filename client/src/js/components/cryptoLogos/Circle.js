import React, {Component} from "react"

class Circle extends Component {

	render() {
		return (

            <svg width="2000px" height="1000px" viewBox="0 0 22 22">
                <defs>
                    <circle id="path-1" cx="10.5" cy="10.5" r="9.5"></circle>
                </defs>
                <g stroke="none" fill="none" fillRule="evenodd">
                    <mask id="mask" fill="white">
                        <use xlinkHref="#path-1"></use>
                    </mask>

                    <circle stroke="#FFFFFF" cx="10.5" cy="10.5" r="9.5" strokeWidth="1"></circle>
                </g>
                <text fontSize="1.25px" alignmentBaseline="central" anchor="middle" x="24%" y="4" fill="white">WELCOME TO</text>
                <text fontSize="1.25px" alignmentBaseline="central" anchor="middle" x="24%" y="6" fill="white">THE FUTURE</text>
                <text fontSize="1.25px" alignmentBaseline="central" anchor="middle" x="24%" y="8" fill="white">OF CROWDFUNDING</text>
                <text fontSize="1.25px" alignmentBaseline="central" anchor="middle" x="24%" y="10" fill="white">WITH...</text>
                <text fontSize="3px" alignmentBaseline="central" anchor="middle" x="12%" y="13" fill="white">JUSTCAUSE</text>
                </svg>
		);
	}
}

export default Circle