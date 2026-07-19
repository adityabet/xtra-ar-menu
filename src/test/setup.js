import '@testing-library/jest-dom';

if (!customElements.get('model-viewer')) {
  customElements.define('model-viewer', class extends HTMLElement {
    static get observedAttributes() { return ['src', 'ar', 'ar-modes']; }
    get loaded() { return false; }
    get canActivateAR() { return false; }
    activateAR() {}
    getFieldOfView() { return 45; }
  });
}

global.matchMedia = global.matchMedia || function () {
  return { matches: false, addListener: () => {}, removeListener: () => {} };
};

global.IntersectionObserver = class {
  observe() {} unobserve() {} disconnect() {}
};

global.ResizeObserver = class {
  observe() {} unobserve() {} disconnect() {}
};
