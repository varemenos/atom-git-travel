'use strict';

module.exports = function (type, item) {
  return `
    <button
      class="${type} btn ${item.current ? 'selected' : ''}"
      data-id="${item.ref.id()}"
      data-name="${item.name}"
    >
      ${item.ref.sha().slice(0, 7)} - ${item.name || item.ref.message()}
    </button>
  `;
};
