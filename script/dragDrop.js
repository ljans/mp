export default class {	
	constructor(referenceElement) {
		
		// Get bounding box of reference element
		this.boundingBox = referenceElement.getBoundingClientRect();
		window.addEventListener('resize', () => { this.boundingBox = referenceElement.getBoundingClientRect(); });

		// Initialize list of known active touches
		this.touches = [];

		// Register handler for moving a touch
		document.addEventListener('touchmove', moveEvent => {
			for(let changedTouch of moveEvent.changedTouches) {

				// Invoke movement handler and prevent scrolling if touch is known
				let handlers = this.touches[changedTouch.identifier];
				if(handlers) {
					handlers.onDragMove(this.getCoordinates(changedTouch));
					moveEvent.preventDefault();
				}
			}
		}, {passive: false});

		// Register handler for ending a touch
		document.addEventListener('touchend', endEvent => {
			for(let changedTouch of endEvent.changedTouches) {

				// Check wether the changed touch really ended (one touch might have moved while another ended)
				let ended = true;
				for(let touch of endEvent.touches) {
					if(changedTouch.identifier == touch.identifier) ended = false;
				}

				// Invoke ending handler for ended known touch and remove it from the list
				let handlers = this.touches[changedTouch.identifier];
				if(ended && handlers) {
					handlers.onDragEnd(this.getCoordinates(changedTouch));
					delete this.touches[changedTouch.identifier];
				}
			}
		});
	}

	// Bind drag and drop handlers to element
	addBinding(element, handlers) {

		// Register handler for drag and drop by touch
		element.addEventListener('touchstart', startEvent => {
			for(let touch of startEvent.changedTouches) {

				// Invoke starting handler on newly started (unknown) touch and add it to the list
				if(!this.touches[touch.identifier]) {
					this.touches[touch.identifier] = handlers;
					handlers.onDragStart(this.getCoordinates(touch));
				}
			}
		});

		// Register handler for drag and drop by left mouse button
		element.addEventListener('mousedown', startEvent => {
			if(startEvent.which !== 1) return;

			// Invoke starting handler
			handlers.onDragStart(this.getCoordinates(startEvent));

			// Define movement tracker
			let tracker = moveEvent => {
				handlers.onDragMove(this.getCoordinates(moveEvent));

				// Prevent selecting text
				moveEvent.preventDefault();
			}

			// Start movement tracker
			document.addEventListener('mousemove', tracker);

			// When the left mouse button is released again
			document.addEventListener('mouseup', endEvent => {
				if (endEvent.which !== 1) return;

				// Stop movement tracker and invoke ending handler
				document.removeEventListener('mousemove', tracker);
				handlers.onDragEnd(this.getCoordinates(endEvent));
			}, { once: true });
		});
	}

	// Transform emitter position to local coordinates
	getCoordinates(e) {
		return {
			x: e.pageX - Math.round(this.boundingBox.x),
			y: e.pageY - Math.round(this.boundingBox.y),
		};
	}
}