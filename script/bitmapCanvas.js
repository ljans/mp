export default class {

	// Construct the bitmap
	constructor(bitmapSrc) {
		this.bitmap = new Image();
		this.bitmap.src = bitmapSrc;

		// Create canvas and store context
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
	}

	// Load the bitmap, store its dimension and draw into canvas
	async load() {
		await this.bitmap.decode();
		this.canvas.width = this.width = this.bitmap.width;
		this.canvas.height = this.height = this.bitmap.height;
		this.context.drawImage(this.bitmap, 0, 0);
	}

	// Extract a simplified binary version of the image
	extractBinary() {
		this.binary = [];

		// Extract whole pixel rectangle
		let image = this.context.getImageData(0, 0, this.width, this.height);

		// Read pixel by pixel
		for (let x = 0; x < this.width; x++) {
			this.binary[x] = [];
			for (let y = 0; y < this.height; y++) {
				let index = y * this.width + x;
				let [R, G, B, a] = image.data.slice(4 * index, 4 * (index + 1));
				this.binary[x][y] = R == 255 && G == 255 && B == 255 && a == 255;
			}
		}
	}

	// Calculate (x,y) coordinates from bitmap index
	toXY(index) {
		return [index % this.width, Math.floor(index / this.width)];
	}

	// Detect outer object border in the binary image
	detectBorder() {

		// Define neighborhood (4 or 8, how to get the pixel in the corresponding direction must be defined!)
		/* Directions for neighborhood=4:
		 * 0: right
		 * 1: top
		 * 2: left
		 * 3: bottom
		 */
		let neighborhood = 4;

		// Find first border pixel and the direction coming from
		let x, y;
		findFirst: for (y = 0; y < this.height; y++) {
			for (x = 0; x < this.width; x++) {
				if (!this.binary[x][y]) break findFirst;
			}
		}
		this.border = [[x, y]];
		let from = 2;

		// Initialize contour
		this.contour = new Path2D();
		this.contour.moveTo(x, y);

		// Loop for finding all border pixels
		// (The border is never longer than the total amount of pixels, so an infinte loop is prevented in case something wents wrong)
		findingBorder: for (let iteration = 0; iteration < this.height * this.width; iteration++) {

			// Get the most recently found border pixel
			let [oldX, oldY] = [x, y];

			// Search adjacent border pixel by iterating counter-clockwise from the starting direction over all other directions
			for (let skip = 1; skip < neighborhood; skip++) {

				[x, y] = [oldX, oldY];

				// The search direction is where we were coming from + 1 + all directions where no border pixel was found previously
				let search = (from + skip) % neighborhood;

				// Find the pixel in the search direction (if still inside the picture)
				if (search === 0 && oldX < this.width - 1) x++;
				else if (search === 1 && oldY > 0) y--;
				else if (search === 2 && oldX > 0) x--;
				else if (search === 3 && oldY < this.height - 1) y++;
				else continue;

				// If the checked pixel is black
				if (!this.binary[x][y]) {

					// Terminate searching if the start is reached again
					if (
						this.border.length > 2 &&
						oldX === this.border[0][0] &&
						oldY === this.border[0][1] &&
						x === this.border[1][0] &&
						y === this.border[1][1]
					) {
						this.border.pop();
						break findingBorder;
					}

					// Store the border pixel
					this.border.push([x, y]);
					this.contour.lineTo(x, y);

					// For the next pixel, we are coming from the opposite of the current search direction
					from = (search + neighborhood / 2) % neighborhood;
					break;
				}
			}
		}
	}

	// Make all pixels outside the border transparent
	cropToBorder() {

		// Extract whole pixel rectangle
		let image = this.context.getImageData(0, 0, this.width, this.height);

		// Check all pixels
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				let index = y * this.width + x;

				// Set opacity to 0 if pixel is outside the contour
				if (!this.context.isPointInPath(this.contour, x, y)) image.data[4 * index + 3] = 0;
			}
		}

		// Apply changes
		this.context.putImageData(image, 0, 0);
	}
}