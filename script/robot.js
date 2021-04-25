export default class Robot extends HTMLElement {

	constructor() {
		super();

		// Create shadowDOM and insert template
		this.attachShadow({ mode: 'open' });
		let template = document.querySelector('template');
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}
}