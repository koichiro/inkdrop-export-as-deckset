"use strict";

module.exports = {
  activate() {
    this.subscription = inkdrop.commands.add(document.body, {
      'export-as-deckset:all': () => this.exportAll(),
      'export-as-deckset:single': () => this.exportSingleNote()
    });
  },

  exportAll() {
    const {
      exportAll
    } = require('./exporter');

    exportAll();
  },

  exportSingleNote() {
    const {
      exportSingleNote
    } = require('./exporter');

    exportSingleNote();
  }

};
//# sourceMappingURL=index.js.map