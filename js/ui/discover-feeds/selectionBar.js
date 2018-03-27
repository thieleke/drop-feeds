'use strict';
class SelectionRaw { /*exported SelectionRaw*/
  static get instance() {
    if (!this._instance) {
      this._instance = new SelectionRaw();
    }
    return this._instance;
  }

  constructor() {
    this._selectedElement = null;
  }

  put(targetElement) {
    this._removeOld();
    this._putNew(targetElement);
  }

  hide() {
    this._removeOld();
    this._selectedElement = null;
  }

  get selectedElement() {
    return this._selectedElement;
  }

  _removeOld() {
    if (! this._selectedElement) { return; }
    this._selectedElement.style.color = '';
    this._selectedElement.classList.remove('selectionRaw');
  }

  _putNew(selectedElement) {
    this._selectedElement = selectedElement;
    if (! this._selectedElement) { return; }
    this._selectedElement.style.color = 'white';
    this._selectedElement.classList.add('selectionRaw');
  }

}
