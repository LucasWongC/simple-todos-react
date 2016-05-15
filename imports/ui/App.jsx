import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer} from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

// App component - represent the whole app
export default class App extends Component {
	constructor(props) {
		super(props);
	
		this.state = {
			'hideCompleted': false
		}
	}

	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
	
		Meteor.call('tasks.insert', text);
		
		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = '';
	}

	renderTasks() {
		let filteredTasks = this.props.tasks;
		if (this.state.hideCompleted) {
			filteredTasks = filteredTasks.filter(task => !task.checked);
		}

		return filteredTasks.map((task) => {
			const currentUserId = this.props.currentUser && this.props.currentUser._id;
			const showPrivateButton = task.owner === currentUserId;

			return (
				<Task key={task._id} task={task} showPrivateButton={showPrivateButton}/>
			);
		});
	}

	toggleHideCompleted() {
		this.setState({
			'hideCompleted': !this.state.hideCompleted
		});
	}

	renderLoginForm() {
		return (
			<form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
				<input
					type="text"
					ref="textInput"
					placeholder="Type to add new taks" />
			</form>
		);
	}

	render() {
		return (
			<div className="container">
				<header>
					<h1>Todo List ({this.props.incompleteCount})</h1>

					<label className="hide-completed">
						<input 
							type="checkbox"
							readOnly
							checked={this.state.hideCompleted}
							onClick={this.toggleHideCompleted.bind(this)} />
							Hide Completed Tasks
					</label>
					
					<AccountsUIWrapper />

					{ this.props.currentUser ? this.renderLoginForm() : '' }
				</header>

				<ul>
					{ this.renderTasks() }
				</ul>
			</div>
		);
	}
};

App.propTypes = {
	'tasks': PropTypes.array.isRequired,
	'incompleteCount': PropTypes.number.isRequired,
	'currentUser': PropTypes.object
};

export default createContainer(() => {
	Meteor.subscribe('tasks');

	const tasks = Tasks.find({}, { 'sort': { 'createdAt': -1 } }).fetch()
	const incompleteCount = Tasks.find({ 'checked': { '$ne': true } }).count();
	console.log(tasks, incompleteCount);

	return {
		'tasks': tasks,
		'incompleteCount': incompleteCount,
		'currentUser': Meteor.user()
	}
}, App);