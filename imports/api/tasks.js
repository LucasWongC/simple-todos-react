import { Meteor } from 'meteor/meteor'; 
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');
console.log(Tasks);

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('tasks', function tasksPublication() {
		const tasks = Tasks.find({
			'$or': [
				{ 'private': { '$ne': true } },
				{ 'owner': this.userId }
			]
		});

		return tasks;
	});
}

Meteor.methods({
	'tasks.insert'(text) {
			check(text, String);

			// Make sure the user is logged in before inserting a task
			if (! this.userId) {
				throw new Meteor.Error('non-authorized');
			}

			console.log('Insert task');
			
			Tasks.insert({
				text,
				createdAt: new Date(),
				owner: this.userId,
				username: Meteor.users.findOne(this.userId).username,
			});
	},
	'tasks.remove'(taskId) {
		check(taskId, String);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== this.userId) {
			// if the task is private, make sure only the owner can delete it
			throw new Meteor.Error('not-authorized');
		}

		Tasks.remove(taskId);
	},
	'tasks.setChecked'(taskId, setChecked) {
		check(taskId, String);
		check(setChecked, Boolean);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== this.userId) {
			// if the task is private, make sure only the owner can delete it
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, { '$set': { 'checked': setChecked } });
	},
	'tasks.setPrivate'(taskId, setPrivate) {
		check(taskId, String);
		check(setPrivate, Boolean);

		const task = Tasks.findOne(taskId);

		// Make sure only the task owner can make a task private
		if (task.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, { '$set': { 'private': setPrivate } } );
	}
});
