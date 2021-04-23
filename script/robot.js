export default class Robot extends HTMLElement {

	constructor() {
		super();

		// Create shadowDOM and insert template
		this.attachShadow({ mode: 'open' });
		let template = document.querySelector('#robotTemplate');
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}

	// Spawn/despawn robot
	spawn() { document.body.appendChild(this); }
	despawn() { document.body.removeChild(this); }
}