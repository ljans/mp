import View from './view.js';
import Controller from './controller.js';

const controller = new Controller();
await controller.prepare();

const view = new View(controller);
