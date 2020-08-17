import Action from '../action';
import { loadJson } from '../utils';
import { addElement, createElement } from './utils';

export default class LoadLayout extends Action {

  constructor() {
    super({
      needsSelection: false,
      needsTarget: false,
    });
  }

  addNode(wom, nodeConfig, parentNode = null) {
    let node = null;
    if (parentNode !== null) {
      const { name, slot } = nodeConfig;
      node = createElement(name, slot);
      addElement(wom, node, parentNode, 'inside');
    } else {
      node = wom.womNode.getNode();
    }
    nodeConfig.children.reverse().forEach(config => {
      this.addNode(wom, config, node);
    });
  }

  execute({ wom }) {
    loadJson().then(({ result, error }) => {
      if (error) {
        alert('error loading layout!');
        return;
      }
      wom.selectAction('newLayout');
      this.addNode(wom, result);
      wom.deselectNode();
    });
  };
}