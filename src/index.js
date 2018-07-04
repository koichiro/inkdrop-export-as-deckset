module.exports = {
  activate() {
    this.subscription = inkdrop.commands.add(document.body, {
      'export-as-deckset:single': () => this.exportSingleNote()
    })
  },

  exportSingleNote() {
    const { exportSingleNote } = require('./exporter')
    exportSingleNote()
  }
}
