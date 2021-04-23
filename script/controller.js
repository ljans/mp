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
		this.robot.findBorder();
		this.robot.crop();
	}

	// Check if robot can be placed at (x,y) in environment
	isFree(x, y) {

		// Extract relevant square from environment
		let environmentData = this.environment.context.getImageData(
			x - this.robot.width / 2,
			y - this.robot.height / 2,
			this.robot.width,
			this.robot.height
		);

		// Extract complete robot square
		let robotData = this.robot.context.getImageData(0, 0, this.robot.width, this.robot.height);

		// Iterate over all robot pixels
		for (let i = 0; i < this.robot.width * this.robot.height * 4; i += 4) {

			// Extract RGB data
			let [robotR, robotG, robotB, robotA] = robotData.data.slice(i, i + 3);
			let [environmentR, environmentG, environmentB, environmentA] = environmentData.data.slice(i, i + 3);

			// Determine if pixels are black
			let threshold = 200;
			let robotIsBlack = robotR < threshold && robotG < threshold && robotB < threshold;
			let environmentIsBlack = environmentR < threshold && environmentG < threshold && environmentB < threshold;

			// Check if black pixels overlap
			if (robotIsBlack && environmentIsBlack) return false;
		} return true;
	}
}