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

			// Store touch index
			let identifier = startEvent.changedTouches[0].identifier;

			// Define movement tracker
			let tracker = moveEvent => {
				this.onDragMove(...this.getTouchCoordinates(moveEvent, identifier));

				// Prevent scrolling by touch
				moveEvent.preventDefault();
			}

			// Invoke starting handler
			this.onDragStart(...this.getTouchCoordinates(startEvent, identifier));

			// Start movement tracker
			document.addEventListener('touchmove', tracker, { passive: false });

			// Stop movement handler when dragging is stopped
			document.addEventListener('touchend', endEvent => {
				document.removeEventListener('touchmove', tracker);

				// Invoke stopping handler
				this.onDragEnd(...this.getTouchCoordinates(endEvent, identifier));
			}, { once: true });
		}

		// For left mouse clicks
		if (startEvent instanceof MouseEvent && startEvent.which === 1) {

			// Define movement tracker
			let tracker = moveEvent => {
				this.onDragMove(...this.getCoordinates(moveEvent));

				// Prevent selecting text
				moveEvent.preventDefault();
			}

			// Invoke starting handler
			this.onDragStart(...this.getCoordinates(startEvent));

			// Start movement tracker
			document.addEventListener('mousemove', tracker);

			// Stop movement handler when dragging is stopped
			document.addEventListener('mouseup', endEvent => {
				if (endEvent.which !== 1) return;
				document.removeEventListener('mousemove', tracker);

				// Invoke stopping handler
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

	// Transform touch event to local coordinates
	getTouchCoordinates(e, identifier) {
		for(let touch of e.changedTouches) {
			if(touch.identifier == identifier) return this.getCoordinates(touch);
		}
	}
}