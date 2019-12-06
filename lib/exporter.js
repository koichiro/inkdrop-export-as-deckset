"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportSingleNote = exportSingleNote;
exports.exportNote = exportNote;

var _electron = require("electron");

var _path = _interopRequireDefault(require("path"));

var _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));

var _fs = _interopRequireDefault(require("fs"));

var _touch = _interopRequireDefault(require("touch"));

var _moment = _interopRequireDefault(require("moment"));

var _inkdrop = require("inkdrop");

var _inkdropExportUtils = require("inkdrop-export-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

const {
  dialog
} = _electron.remote;

async function exportSingleNote() {
  const {
    editingNote
  } = inkdrop.store.getState();
  const pathToSave = dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: `${editingNote.title}.md`,
    filters: [{
      name: 'Markdown Files',
      extensions: ['md']
    }]
  });

  if (pathToSave) {
    try {
      const destDir = _path["default"].dirname(pathToSave);

      const fileName = _path["default"].basename(pathToSave);

      await exportNote(editingNote, destDir, fileName);
    } catch (e) {
      _inkdrop.logger.error('Failed to export editing note:', e, editingNote);

      inkdrop.notifications.addError('Failed to export editing note', {
        detail: e.message,
        dismissable: true
      });
    }
  }
}

async function exportNote(note, pathToSave, fileName) {
  if (note.body) {
    const datestr = (0, _moment["default"])(note.createdAt).format('YYYYMMDD');
    fileName = fileName || (0, _sanitizeFilename["default"])(datestr + '-' + note.title + '-' + note._id.substr(5)) + '.md';

    const filePath = _path["default"].join(pathToSave, fileName);

    let body = note.body;
    body = await (0, _inkdropExportUtils.replaceImages)(body, pathToSave, pathToSave);

    _fs["default"].writeFileSync(filePath, body);

    _touch["default"].sync(filePath, {
      time: new Date(note.updatedAt)
    });
  }
}