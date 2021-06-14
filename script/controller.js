import BitmapCanvas from './bitmapCanvas.js';

export default class {

	// Setup canvases
	constructor() {
		this.environment = new BitmapCanvas('./image/environment.bmp');
		this.robot = new BitmapCanvas('./image/robot.bmp');
	}

	// Preparation
	async prepare() {
		await this.environment.load();
		await this.robot.load();

		// Robot preprocessing
		this.robot.extractBinary();
		this.robot.detectBorder();

		// Extract whole pixel rectangle
		let image = this.robot.context.getImageData(0, 0, this.robot.width, this.robot.height);

		// Crop to border
		for (let i = 0; i < this.robot.height; i++) {
			for (let j = 0; j < this.robot.width; j++) {
				let index = i * this.robot.width + j;
				if (!this.robot.context.isPointInPath(this.robot.contour, i, j)) image.data[4 * index + 3] = 0;
			}
		}

		// Apply changes
		this.robot.context.putImageData(image, 0, 0);
	}

	// Check if robot can be placed at (x,y) in environment
	isColliding(x, y) {

		// Extract relevant square from environment
		let environmentData = this.environment.context.getImageData(
			x - this.robot.width / 2,
			y - this.robot.height / 2,
			this.robot.width,
			this.robot.height
		);

		// Iterate over all border pixels
		for (let index of this.robot.border) {

			// Check for an obstacle
			let [r, g, b, a] = environmentData.data.slice(4*index, 4*index + 3);
			let threshold = 200;
			if(r < threshold && g < threshold && b < threshold) return true;
		}
	}
}