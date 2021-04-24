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

		// Find workspace
		this.workspace = document.querySelector('.ui .workspace');
	}

	// Setup view
	async prepare() {

		// Draw environment image
		this.environment = this.workspace.querySelector('.environment');
		this.environment.src = this.controller.environment.toDataURL();
		await this.environment.decode();

		// For each robot index
		for (let index in [View.INIT_CONFIG, View.GOAL_CONFIG]) {

			// Construct robot blueprint in its slot
			this.blueprints[index] = new Robot();
			this.blueprints[index].className = ['init', 'goal'][index];
			document.querySelectorAll('.sidebar .configuration .slot')[index].appendChild(this.blueprints[index]);

			// Draw robot image
			let image = new Image();
			image.src = this.controller.robot.toDataURL();
			this.blueprints[index].appendChild(image);

			// Setup drag and drop
			let robotDragDrop = new DragDrop(this.workspace);
			let blueprintDragDrop = new DragDrop(this.workspace);

			// Bind drag and drop to blueprint
			blueprintDragDrop.bindTo(this.blueprints[index]);

			// When dragging the robot is started
			robotDragDrop.onDragStart = (x, y) => {

				// Put document in dragging state and move robot to emmiter location
				document.body.classList.add('dragging');
				this.trackMouse(index, x, y);
			}

			// When moving the robot
			robotDragDrop.onDragMove = (x, y) => {

				// Let robot follow the movement and check whether its position is valid
				this.trackMouse(index, x, y);
				this.robots[index].classList.toggle('colliding', !this.isValidPosition(index, x, y));
			}

			// When dragging the robot is ended
			robotDragDrop.onDragEnd = (x, y) => {

				// Reset the dragging state
				document.body.classList.remove('dragging');

				// Store a valid drop location
				if (this.isValidPosition(index, x, y)) {
					this.robots[index].x = x;
					this.robots[index].y = y;

					// Or despawn misplaced robot
				} else {
					this.despawn(this.robots[index]);
					delete this.robots[index];
				}
			}

			// When dragging the blueprint is started
			blueprintDragDrop.onDragStart = (x, y) => {

				// Spawn robot as copy of blueprint if not already existing
				if (!this.robots[index]) {
					this.robots[index] = this.blueprints[index].cloneNode(true);
					this.spawn(this.robots[index]);

					// Shift (0,0) to center (is on top left corner by default)
					this.robots[index].style.margin = `-${this.controller.robot.height / 2}px -${this.controller.robot.width / 2}px`;

					// Bind drag and drop to robot
					robotDragDrop.bindTo(this.robots[index]);
				}

				// Bubble event to robot
				robotDragDrop.onDragStart(x, y);
			}

			// Bubble move and end events from blueprint to robot
			blueprintDragDrop.onDragMove = (x,y) => robotDragDrop.onDragMove(x,y);
			blueprintDragDrop.onDragEnd = (x,y) => robotDragDrop.onDragEnd(x,y);
		}
	}

	spawn(robot) { this.workspace.appendChild(robot); }
	despawn(robot) { this.workspace.removeChild(robot); }

	// Place robot at position of causing event
	trackMouse(index, x, y) {
		this.robots[index].style.left = x + 'px';
		this.robots[index].style.top = y + 'px';
	}

	// Check if robot can be placed at emitter position
	isValidPosition(index, x, y) {

		// Return wheter robot is inside environment and free
		return (
			0 < x && x < this.environment.width &&
			0 < y && y < this.environment.height
		) ? this.controller.isFree(x, y) : false;
	}
}