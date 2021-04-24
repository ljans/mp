export default class {

	// Placeholder event handlers
	onDragStart() { }
	onDragMove() { }
	onDragEnd() { }

	// Get bounding box of reference element
	constructor(referenceElement) {
		this.boundingBox = referenceElement.getBoundingClientRect();
		window.addEventListener('resize', () => { this.boundingBox = referenceElement.getBoundingClientRect(); });
	}

	// Handle event that should start dragging (e.g. mousedown, touchstart)
	handleDragStart(startEvent) {

		// For touch events
		if (startEvent instanceof TouchEvent) {

			// Store starting touch and invoke starting handler
			let startingTouch = startEvent.changedTouches[0];
			this.onDragStart(...this.getCoordinates(startingTouch));

			// Define movement tracker
			let tracker = moveEvent => {

				// Invoke movement handler on corresponding touch
				for(let touch of moveEvent.touches) {
					if(touch.identifier == startingTouch.identifier) this.onDragMove(...this.getCoordinates(touch));
				}

				// Prevent scrolling by touch
				moveEvent.preventDefault();
			}

			// Start movement tracker
			document.addEventListener('touchmove', tracker, { passive: false });

			// When corresponding touch is ended
			document.addEventListener('touchend', endEvent => {

				// Invoke movement handler on matching touch
				for(let touch of endEvent.changedTouches) {
					if(touch.identifier == startingTouch.identifier) {
						
						// Stop movement tracker and invoke ending handler
						document.removeEventListener('touchmove', tracker);
						this.onDragEnd(...this.getCoordinates(touch));
					}
				}
			}, { once: true });
		}

		// For left mouse clicks
		if (startEvent instanceof MouseEvent && startEvent.which === 1) {

			// Invoke starting handler
			this.onDragStart(...this.getCoordinates(startEvent));

			// Define movement tracker
			let tracker = moveEvent => {
				this.onDragMove(...this.getCoordinates(moveEvent));

				// Prevent selecting text
				moveEvent.preventDefault();
			}

			// Start movement tracker
			document.addEventListener('mousemove', tracker);

			// When dragging is ended
			document.addEventListener('mouseup', endEvent => {
				if (endEvent.which !== 1) return;

				// Stop movement tracker and invoke ending handler
				document.removeEventListener('mousemove', tracker);
				this.onDragEnd(...this.getCoordinates(endEvent));
			}, { once: true });
		}
	}

	// Listen to events that start dragging
	bindTo(element) {
		element.addEventListener('touchstart', this.handleDragStart.bind(this));
		element.addEventListener('mousedown', this.handleDragStart.bind(this));
	}

	// Transform emitter position to local coordinates
	getCoordinates(e) {
		return [
			e.pageX - Math.round(this.boundingBox.x),
			e.pageY - Math.round(this.boundingBox.y)
		];
	}
}