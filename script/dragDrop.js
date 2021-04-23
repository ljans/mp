export default class {

	// Placeholder event handlers
	onDragStart() { }
	onDragMove() { }
	onDragEnd() { }

	// Handle event that should start dragging (e.g. mousedown, touchstart)
	handleDragStart(startEvent) {

		// Define movement tracker
		let tracker = moveEvent => this.onDragMove(moveEvent);

		// For touch events
		if (startEvent instanceof TouchEvent) {

			// Invoke starting handler
			this.onDragStart(startEvent);

			// Start movement tracker
			document.addEventListener('touchmove', tracker);

			// Stop movement handler when dragging is stopped
			document.addEventListener('touchend', endEvent => {
				document.removeEventListener('touchmove', tracker);

				// Invoke stopping handler
				this.onDragEnd(endEvent);
			}, { once: true });
		}

		// For left mouse clicks
		if (startEvent instanceof MouseEvent && startEvent.which === 1) {

			// Invoke starting handler
			this.onDragStart(startEvent);

			// Start movement tracker
			document.addEventListener('mousemove', tracker);

			// Stop movement handler when dragging is stopped
			document.addEventListener('mouseup', endEvent => {
				if (endEvent.which !== 1) return;
				document.removeEventListener('mousemove', tracker);

				// Invoke stopping handler
				this.onDragEnd(endEvent);
			}, { once: true });
		}
	}

	// Listen to events that start dragging
	bindTo(element) {
		element.addEventListener('touchstart', this.handleDragStart.bind(this));
		element.addEventListener('mousedown', this.handleDragStart.bind(this));
	}
}