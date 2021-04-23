export default class {

	// Setup canvases
	async prepare() {
		this.environment = await this.drawCanvas('./image/environment.bmp');
		this.robot = await this.drawCanvas('./image/robot.bmp');
	}

	// Draw canvas from bitmap source file
	async drawCanvas(src) {

		// Load image
		let image = new Image();
		image.src = src;
		await image.decode();

		// Draw into canvas
		let canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.context = canvas.getContext('2d');
		canvas.context.drawImage(image, 0, 0);
		return canvas;
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