import Robot from './robot.js';
import DragDrop from './dragDrop.js';

export default class View {

	// Arrays for holding robot objects
	robots = [];
	blueprints = [];

	// Indices of robots inside arrays (can later be changed to n checkpoints 0,...,n-1)
	static INIT_CONFIG = 0;
	static GOAL_CONFIG = 1;

	// Construct with controller
	constructor(controller) {
		this.controller = controller;

		// Define custom html tag (must happen before manually constructing the element!)
		customElements.define('robot-frame', Robot);

		// Find workspace
		this.workspace = document.querySelector('.ui .workspace');
	}

	// Put document in dragging state and move robot to emmiter location on drag start
	onDragStart(index, coordinates) {
		document.body.classList.add('dragging');
		this.trackMouse(index, coordinates);
	}

	// Let robot follow the movement and check whether its position is valid on drag move
	onDragMove(index, coordinates) {
		this.trackMouse(index, coordinates);
		this.robots[index].classList.toggle('colliding', !this.isValidPosition(index, coordinates));
	}

	// Reset the dragging state and store a valid drop location or despawn misplaced robot on drag end
	onDragEnd(index, coordinates) {
		document.body.classList.remove('dragging');
		if (this.isValidPosition(index, coordinates)) this.robots[index].coordinates = coordinates;
		else this.despawn(this.robots[index]), delete this.robots[index];
	}

	// Setup view
	async prepare() {

		// Draw environment image
		this.environment = document.querySelector('.environment');
		this.environment.src = this.controller.environment.canvas.toDataURL();

		// For each robot index
		for (let index in [View.INIT_CONFIG, View.GOAL_CONFIG]) {

			// Construct robot blueprint in its slot
			this.blueprints[index] = new Robot();
			this.blueprints[index].className = ['init', 'goal'][index];
			document.querySelectorAll('.sidebar .configuration .slot')[index].appendChild(this.blueprints[index]);

			// Draw blueprint image
			let image = new Image();
			image.src = this.controller.robot.canvas.toDataURL();
			this.blueprints[index].appendChild(image);

			// Bind drag and drop to blueprint
			let dragDrop = new DragDrop(this.workspace);
			dragDrop.addBinding(this.blueprints[index], {
				onDragStart: coordinates => {

					// Spawn robot as copy of blueprint if not already existing
					if (!this.robots[index]) {
						this.robots[index] = this.blueprints[index].cloneNode(true);
						this.spawn(this.robots[index]);

						// Shift (0,0) to center (is on top left corner by default)
						this.robots[index].style.margin = `-${this.controller.robot.height / 2}px -${this.controller.robot.width / 2}px`;

						// Bind drag and drop to robot
						dragDrop.addBinding(this.robots[index], {
							onDragStart: this.onDragStart.bind(this, index),
							onDragMove: this.onDragMove.bind(this, index),
							onDragEnd: this.onDragEnd.bind(this, index),
						});
					}

					// Bubble drag start to robot
					this.onDragStart(index, coordinates);
				},
				onDragMove: this.onDragMove.bind(this, index),
				onDragEnd: this.onDragEnd.bind(this, index),
			});
		}
	}

	// Spawn/despawn robot in workspace
	spawn(robot) { this.workspace.appendChild(robot); }
	despawn(robot) { this.workspace.removeChild(robot); }

	// Place robot at (x,y)
	trackMouse(index, {x, y}) {
		this.robots[index].style.left = x + 'px';
		this.robots[index].style.top = y + 'px';
	}

	// Check if robot can be placed at (x,y)
	isValidPosition(index, {x, y}) {

		// Return whether robot is inside environment and free of collision
		return (
			0 < x && x < this.environment.width &&
			0 < y && y < this.environment.height
		) ? !this.controller.isColliding({x, y}) : false;
	}

	// Transform page coordinates to environment coordinates
	getRelativeCoordinates(pageX, pageY) {
		let boundingBox = this.environment.getBoundingClientRect();
		return [pageX - Math.round(boundingBox.x), pageY - Math.round(boundingBox.y)];
	}
}