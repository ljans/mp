import Robot from './robot.js';
import DragDrop from './dragDrop.js';

export default class View {

	// Arrays for holding robot objects
	robots = [];
	blueprints = [];

	// Indices of robots inside arrays (can later be changed to n checkpoints 0,...,n-1)
	static INIT_CONFIG = 0;
	static GOAL_CONFIG = 1;

	constructor(controller) {
		this.controller = controller;

		// Define custom html tag (must happen before manually constructing the element!)
		customElements.define('robot-frame', Robot);

		// Draw environment image
		this.environment = document.querySelector('#environment');
		this.environment.src = this.controller.environment.canvas.toDataURL();

		// For each robot index
		for (let index in [View.INIT_CONFIG, View.GOAL_CONFIG]) {

			// Construct robot blueprint in its slot
			this.blueprints[index] = new Robot();
			this.blueprints[index].className = ['init', 'goal'][index];
			document.querySelectorAll('.sidebar .configuration .slot')[index].appendChild(this.blueprints[index]);

			// Draw robot image
			let image = new Image();
			image.src = this.controller.robot.canvas.toDataURL();
			this.blueprints[index].appendChild(image);

			// Setup drag-and-drop and bind to blueprint
			let robotDragDrop = new DragDrop();
			let blueprintDragDrop = new DragDrop();
			blueprintDragDrop.bindTo(this.blueprints[index]);

			// When dragging the robot is started
			robotDragDrop.onDragStart = e => {

				// Put document in dragging state and move robot to emmiter location
				document.body.classList.add('dragging');
				this.trackMouse(index, e);
			}

			// When moving the robot
			robotDragDrop.onDragMove = e => {

				// Let robot follow the movement and check whether its position is valid
				this.trackMouse(index, e);
				this.robots[index].classList.toggle('colliding', !this.isValidPosition(index, e));

				// Clear selection (weird selecting happens on drag-an-drop)
				document.getSelection().removeAllRanges();
			}

			// When dragging the robot is stopped
			robotDragDrop.onDragEnd = e => {

				// Reset the dragging state
				document.body.classList.remove('dragging');

				// Store a valid drop location
				if (this.isValidPosition(index, e)) {
					let [x, y] = this.getRelativeCoordinates(e.pageX, e.pageY);
					this.robots[index].x = x;
					this.robots[index].y = y;

					// Or despawn misplaced robot
				} else {
					this.robots[index].despawn();
					delete this.robots[index];
				}
			}

			// When dragging the blueprint is started
			blueprintDragDrop.onDragStart = e => {

				// Spawn robot as copy of blueprint if not already existing
				if (!this.robots[index]) {
					this.robots[index] = this.blueprints[index].cloneNode(true);
					this.robots[index].spawn();

					// Shift (0,0) to center (is on top left corner by default)
					this.robots[index].style.margin = `-${this.controller.robot.height / 2}px -${this.controller.robot.width / 2}px`;

					// Bind drag-and-drop to robot
					robotDragDrop.bindTo(this.robots[index]);
				}

				// Bubble event to robot
				robotDragDrop.handleDragStart(e);
			}
		}
	}

	// Place robot at position of causing event
	trackMouse(index, e) {
		this.robots[index].style.top = e.pageY + 'px';
		this.robots[index].style.left = e.pageX + 'px';
	}

	// Check if robot can be placed at emitter position
	isValidPosition(index, e) {
		let [x, y] = this.getRelativeCoordinates(e.pageX, e.pageY);

		// Return whether robot is inside environment and free of collision
		return (
			0 < x && x < this.environment.width &&
			0 < y && y < this.environment.height
		) ? !this.controller.isColliding(x, y) : false;
	}

	// Transform page coordinates to environment coordinates
	getRelativeCoordinates(pageX, pageY) {
		let boundingBox = this.environment.getBoundingClientRect();
		return [pageX - Math.round(boundingBox.x), pageY - Math.round(boundingBox.y)];
	}
}