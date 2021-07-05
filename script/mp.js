import { Node, Graph } from './graph.js';

export default class {

	constructor(controller) {
		this.controller = controller;
	}

	// Get a random point (x,y) inside the environment
	getSample() {
		return [
			Math.floor(Math.random() * this.controller.environment.width),
			Math.floor(Math.random() * this.controller.environment.height),
		];
	}

	// Simple probabilistic roadmap
	sPRM(init, goal, r, n) {

		// Initialize graph and add init and goal nodes
		this.graph = new Graph();
		this.graph.addNode(init);
		this.graph.addNode(goal);

		// Add samples
		for (let j = 0; j < n; j++) {
			let [x, y] = this.getSample();
			if (!this.controller.isInObstacle([x, y])) this.graph.addNode(new Node([x, y]));
		}

		// Find edges
		for (let node of this.graph.nodes) {
			checkNeighbours: for (let neighbour of this.graph.nodes) {

				// Calculate difference vector
				let [dx, dy] = [node.coordinates[0] - neighbour.coordinates[0], node.coordinates[1] - neighbour.coordinates[1]];

				// Avoid duplicate edges
				if (dx > 0 || dx == 0 && dy >= 0) continue;

				// Check distance
				let d2 = dx * dx + dy * dy;
				if (d2 > r * r) continue;
				let d = Math.sqrt(d2);

				// Check edge
				let samples = d / 10;
				for (let i = 0; i < samples; i++) {
					let [x, y] = [neighbour.coordinates[0] + Math.round(dx * i / samples), neighbour.coordinates[1] + Math.round(dy * i / samples)];
					if (this.controller.isInObstacle([x, y])) continue checkNeighbours;
				}

				// Add valid edge
				this.graph.addEdge(node, neighbour, d);
			}
		}
	}
}