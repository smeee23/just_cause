import { connect } from "react-redux"
import React, {Component} from "react"

class Icon extends Component {
	render() {
		const icons = {
			wallet: 'M7,19 L3,19 L3,3 C9,3 14.3333333,3 19,3 C21.6666667,3 23,4.33333333 23,7 M7,7 L23,7 L23,23 L7,23 L7,7 Z M23,12 L15,12 C13.6666667,12.6666667 13,13.6666667 13,15 C13,16.3333333 13.6666667,17.3333333 15,18 L23,18',
      caret: 'M1 6 12 19 23 6',
      plus: 'M0,12 L24,12 M12,24 L12,0',
			minus: 'M0,12 L24,12',
			pencil: 'M3,21 L5,14 L17,2 L22,7 L9,19 L3,21 Z M14,6 L18,10 L14,6 Z',
			people: 'M8,21 C8,18.3333333 8.66666667,16.3333333 10,15 C11.3333333,13.6666667 12.3333333,12.6666667 13,12 C11.6666667,10.6666667 11,9.33333333 11,8 C11,6 13,4 15,4 C17,4 19,6 19,8 C19,9.33333333 18.3333333,10.6666667 17,12 C17.7215761,12.7215761 18.7215761,13.7215761 20,15 C21.2784239,16.2784239 21.9450905,18.2784239 22,21 L8,21 Z M5,19 L2,19 C2,16.3333333 2.66666667,14.3333333 4,13 C5.33333333,11.6666667 6.33333333,10.6666667 7,10 C5.66666667,8.66666667 5,7.33333333 5,6 C5,4 7,2 9,2 C9.69865112,2 10.3973022,2.2440567 11.0106981,2.64691485',
			poolShape1: '5 5 3 13 9 19 17 17 19 9 13 3',
			poolShape2: '7.08695652 18 3 11 11 4 19 11 14.9130435 18',
			poolShape3: '3 18 3 9 7 4 15 4 19 9 19 18',
			poolShape4: 'M3.259366,14.0819725 L5.12295869,8.28412853 C5.94354544,5.73119197 8.3184244,4 11,4 C13.6815756,4 16.0564546,5.73119197 16.8770413,8.28412853 L18.740634,14.0819725 C19.2476466,15.659345 18.3799484,17.3490731 16.8025759,17.8560857 C16.5058986,17.9514462 16.1961748,18 15.8845483,18 L6.11545168,18 C4.45859743,18 3.11545168,16.6568542 3.11545168,15 C3.11545168,14.6883735 3.16400544,14.3786497 3.259366,14.0819725 Z',
			poolShape5: '17 3 6 6 6 18 17 18',
		};

    const viewboxSize = 24;
    const defaultStrokeWidth = 2;

		const { name, size, color, strokeWidth, isMobile } = this.props;

		const adjustedSize = isMobile ? size * 1 : size;

		return (
			<svg
			className={`icon icon-${name}`}
			width={adjustedSize}
			height={adjustedSize}
			viewBox={`0 0 ${viewboxSize} ${viewboxSize}`}
			stroke={color ? color : '#FFFFFF'}
			strokeWidth={strokeWidth ? `${strokeWidth}` : `${defaultStrokeWidth}`}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round">
				{ icons[name].includes('M') ? (
					<path d={icons[name]} vectorEffect="non-scaling-stroke"/>
				) : (
					<polygon points={icons[name]} vectorEffect="non-scaling-stroke"/>
				)}
			</svg>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
})

export default connect(mapStateToProps)(Icon)
