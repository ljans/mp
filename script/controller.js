import BitmapCanvas from './bitmapCanvas.js';
import UI from './ui.js';
import MP from './mp.js';

export default class {

	// Preparation
	async prepare() {

		// Environment preprocessing
		this.environment = new BitmapCanvas('./image/environment.bmp');
		await this.environment.load();
		this.environment.extractBinary();

		// Robot preprocessing
		this.robot = new BitmapCanvas('./image/robot.bmp');
		await this.robot.load();
		this.robot.extractBinary();
		this.robot.detectBorder();
		this.robot.cropToBorder();

		// Setup UI
		this.ui = new UI(this);
		await this.ui.prepare();
	}

	// Check if robot can be placed at (x,y) in environment
	isInObstacle([x, y]) {

		// Iterate over all border pixels
		for (let [dx, dy] of this.robot.border) {

			let xCheck = x + dx - this.robot.width / 2;
			let yCheck = y + dy - this.robot.height / 2;

			if (!(
				0 <= xCheck && xCheck < this.environment.width &&
				0 <= yCheck && yCheck < this.environment.height
			) || !this.environment.binary[xCheck][yCheck]) return true;
		}
	}

	// Find a path and draw the graph
	findPath(init, goal) {
		let mp = new MP(this);
		mp.sPRM(init, goal, 80, 1000);
		mp.graph.findPathWithDijkstra(init, goal);
		this.ui.drawGraph(mp.graph);
	}
}