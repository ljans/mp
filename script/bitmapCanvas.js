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
		for (let i = 0; i < this.height * this.width; i++) {
			let [R, G, B, a] = image.data.slice(4 * i, 4 * (i + 1));

			// Convert to binary pixel
			this.binary[i] = R == 255 && G == 255 && B == 255 && a == 255;
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
		this.border = [0];
		while (this.binary[this.border[0]]) this.border[0]++;
		let from = 2;

		// Initialize contour
		this.contour = new Path2D();
		this.contour.moveTo(...this.toXY(this.border[0]));

		// Loop for finding all border pixels
		// (The border is never longer than the total amount of pixels, so an infinte loop is prevented in case something wents wrong)
		findingBorder: for (let iteration = 0; iteration < this.height * this.width; iteration++) {

			// Get the most recently found border pixel
			let last = this.border[this.border.length - 1];
			let [columnIndex, rowIndex] = this.toXY(last);

			// Search adjacent border pixel by iterating counter-clockwise from the starting direction over all other directions
			for (let skip = 1; skip < neighborhood; skip++) {

				// Variable for the next pixel candidate
				let check;

				// The search direction is where we were coming from + 1 + all directions where no border pixel was found previously
				let search = (from + skip) % neighborhood;

				// Find the pixel in the search direction (if still inside the picture)
				if (search === 0 && columnIndex < this.width - 1) check = last + 1;
				if (search === 1 && rowIndex > 0) check = last - this.width;
				if (search === 2 && columnIndex > 0) check = last - 1;
				if (search === 3 && rowIndex < this.height - 1) check = last + this.width;

				// If the checked pixel is black
				if (this.binary[check] === false) {

					// Terminate searching if the start is reached again
					if (
						this.border.length > 2 &&
						last === this.border[0] &&
						check === this.border[1]
					) {
						this.border.pop();
						break findingBorder;
					}

					// Store the border pixel
					this.border[this.border.length] = check;
					this.contour.lineTo(...this.toXY(check));

					// For the next pixel, we are coming from the opposite of the current search direction
					from = (search + neighborhood / 2) % neighborhood;
					break;
				}
			}
		}
	}
}