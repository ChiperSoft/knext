
import { Component, PropTypes, Children } from 'react';

/**
 * Extraction of React-Redux's Provider component, reduced to its core functionality.
 */
export default class Provider extends Component {
	static propTypes = {
		store:    PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
		children: PropTypes.element.isRequired,
	};

	static childContextTypes = {
		store: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
	};

	constructor (props, context) {
		super(props, context);
		this.store = props.store;
	}

	getChildContext () {
		return { store: this.store };
	}


	render () {
		return Children.only(this.props.children);
	}
};
