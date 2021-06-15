import BitmapCanvas from './bitmapCanvas.js';
import UI from './ui.js';

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
	isInObstacle({ x, y }) {


		// Iterate over all border pixels
		for (let [dx, dy] of this.robot.border) {
			if (!this.environment.binary[x + dx - this.robot.width / 2][y + dy - this.robot.height / 2]) return true;
		}
	}
}