export class Node {
	adjacentEdges = [];

	constructor(coordinates) {
		this.coordinates = coordinates;
	}

	addEdge(node, weight) {
		this.adjacentEdges.push({ node, weight });
	}
}

export class Graph {
	nodes = [];
	edges = [];

	addNode(node) {
		this.nodes.push(node);
	}

	addEdge(node1, node2, weight) {
		node1.addEdge(node2, weight);
		node2.addEdge(node1, weight);
		this.edges.push([node1, node2]);
	}

	findPathWithDijkstra(startNode, endNode) {
		let pq = new PriorityQueue();

		for (let node of this.nodes) node.time = Infinity;
		startNode.time = 0;

		pq.enqueue([startNode, 0]);

		while (!pq.isEmpty()) {
			let shortestStep = pq.dequeue();
			let currentNode = shortestStep[0];

			for (let neighbour of currentNode.adjacentEdges) {
				let time = currentNode.time + neighbour.weight;

				if (time < neighbour.node.time) {
					neighbour.node.time = time;
					neighbour.node.backtrace = currentNode;
					pq.enqueue([neighbour.node, time]);
				}
			}
		}

		this.path = [endNode];
		let lastStep = endNode;
		while (lastStep !== startNode) {
			if (!lastStep.backtrace) return false;
			this.path.unshift(lastStep.backtrace)
			lastStep = lastStep.backtrace;
		}
	}
}

class PriorityQueue {
	collection = [];

	enqueue(element) {
		if (this.isEmpty()) return this.collection.push(element);

		for (let i in this.collection) {
			if (element[1] < this.collection[i][1]) return this.collection.splice(i, 0, element);
		}

		this.collection.push(element);
	}

	dequeue() {
		return this.collection.shift();
	}

	isEmpty() {
		return this.collection.length === 0;
	}
}
