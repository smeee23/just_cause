import { connect } from "react-redux"
import React, {Component} from "react"

class Icon extends Component {
	render() {
		const icons = {
			wallet: 'M7,19 L3,19 L3,3 C9,3 14.3333333,3 19,3 C21.6666667,3 23,4.33333333 23,7 M7,7 L23,7 L23,23 L7,23 L7,7 Z M23,12 L15,12 C13.6666667,12.6666667 13,13.6666667 13,15 C13,16.3333333 13.6666667,17.3333333 15,18 L23,18',
      caret: 'M1 6 12 19 23 6',
      plus: 'M0,12 L24,12 M12,24 L12,0'
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
			stroke={color} 
			strokeWidth={strokeWidth ? strokeWidth + "" : `${defaultStrokeWidth}`}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round">
				<path d={icons[name]} vectorEffect="non-scaling-stroke"/>
			</svg>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
})

export default connect(mapStateToProps)(Icon)
