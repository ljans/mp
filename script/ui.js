import Robot from './robot.js';
import DragDrop from './dragDrop.js';
import { Node } from './graph.js';

export default class UI {

	// Indices of robots inside arrays (can later be changed to n checkpoints 0,...,n-1)
	static INIT_CONFIG = 0;
	static GOAL_CONFIG = 1;

	// Arrays for holding robot objects
	robots = [];
	blueprints = [];

	constructor(controller) {
		this.controller = controller;

		// Define custom html tag (must happen before manually constructing the element!)
		customElements.define('robot-frame', Robot);

		// Locate elements
		this.workspace = document.querySelector('.ui .workspace');
		this.configspace = document.querySelector('.ui .configspace');
		this.environment = document.querySelector('.environment');
		this.graph = document.querySelector('.ui .graph');
	}


	async prepare() {

		// Draw environment image
		this.environment.src = this.controller.environment.canvas.toDataURL();
		await this.environment.decode();

		// Setup graph
		this.graph.height = this.environment.height;
		this.graph.width = this.environment.width;

		// Draw configspace
		this.configspace.height = this.environment.height;
		this.configspace.width = this.environment.width;
		let context = this.configspace.getContext('2d');
		let image = context.getImageData(0, 0, this.configspace.width, this.configspace.height);
		for (let y = 0; y < this.configspace.height; y++) {
			for (let x = 0; x < this.configspace.width; x++) {
				let colliding = this.controller.isInObstacle([x, y]);
				let index = y * this.configspace.width + x;
				image.data[4 * index] = colliding ? 255 : 0;
				image.data[4 * index + 1] = colliding ? 0 : 255;
				image.data[4 * index + 2] = 0;
				image.data[4 * index + 3] = 255;
			}
		}
		context.putImageData(image, 0, 0);

		// For each robot index
		for (let index of [UI.INIT_CONFIG, UI.GOAL_CONFIG]) {

			// Construct robot blueprint in its slot
			this.blueprints[index] = new Robot();
			this.blueprints[index].className = ['init', 'goal'][index];
			document.querySelectorAll('.sidebar .configuration .slot')[index].appendChild(this.blueprints[index]);

			// Draw blueprint image
			let image = new Image();
			image.src = this.controller.robot.canvas.toDataURL();
			await image.decode();
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

	// Clear Graph
	clearGraph() {
		let context = this.graph.getContext('2d');
		context.clearRect(0, 0, this.graph.width, this.graph.height);
	}

	// Draw graph
	drawGraph(graph) {
		this.clearGraph();
		let context = this.graph.getContext('2d');

		// Draw nodes
		for (let node of graph.nodes) {
			context.fillStyle = 'rgba(0,0,0,0.2)';
			context.fillRect(node.coordinates[0] - 2, node.coordinates[1] - 2, 4, 4);
		}

		// Draw edges
		for (let edge of graph.edges) {
			context.beginPath();
			context.lineWidth = 1;
			context.strokeStyle = 'rgba(0,0,0,0.15)';
			context.moveTo(edge[0].coordinates[0], edge[0].coordinates[1]);
			context.lineTo(edge[1].coordinates[0], edge[1].coordinates[1]);
			context.stroke();
		}

		// Draw path
		for (let i = 0; i < graph.path.length; i++) {
			let node = graph.path[i];
			context.fillStyle = '#00F';
			context.fillRect(node.coordinates[0] - 2, node.coordinates[1] - 2, 4, 4);

			// Draw path edges
			if (i == graph.path.length) continue;
			for (let edge of node.adjacentEdges) {
				let next = graph.path[i + 1];
				if (next == edge.node) {
					context.beginPath();
					context.lineWidth = 2;
					context.strokeStyle = '#00F';
					context.moveTo(node.coordinates[0], node.coordinates[1]);
					context.lineTo(next.coordinates[0], next.coordinates[1]);
					context.stroke();
					break;
				}
			}
		}
	}

	// Spawn/despawn robot in workspace
	spawn(robot) { this.workspace.appendChild(robot); }
	despawn(robot) { this.workspace.removeChild(robot); }

	// Place robot at (x,y)
	trackMouse(index, [x, y]) {
		this.robots[index].style.left = x + 'px';
		this.robots[index].style.top = y + 'px';
	}

	// Put document in dragging state and move robot to emmiter location on drag start
	onDragStart(index, coordinates) {
		document.body.classList.add('dragging');
		this.trackMouse(index, coordinates);
		this.clearGraph();
	}

	// Let robot follow the movement and check whether its position is valid on drag move
	onDragMove(index, coordinates) {
		this.trackMouse(index, coordinates);
		this.robots[index].classList.toggle('colliding', !!this.controller.isInObstacle(coordinates));
	}

	// Reset the dragging state on drag end
	onDragEnd(index, coordinates) {
		document.body.classList.remove('dragging');

		// Despawn misplaced robot
		if (this.controller.isInObstacle(coordinates)) {
			this.despawn(this.robots[index]);
			delete this.robots[index];

		// Store valid location and find path
		} else {
			this.robots[index].coordinates = coordinates;
			let init = this.robots[UI.INIT_CONFIG];
			let goal = this.robots[UI.GOAL_CONFIG];
			if (init && goal) this.controller.findPath(new Node(init.coordinates), new Node(goal.coordinates));
		}
	}
}