'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportSingleNote = exportSingleNote;
exports.exportNote = exportNote;
exports.exportImage = exportImage;

var _electron = require('electron');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { dialog, app } = _electron.remote;

async function exportSingleNote() {
  const { document } = inkdrop.flux.getStore('editor').getState();
  const pathToSave = dialog.showSaveDialog({
    title: 'Save Deckset File',
    defaultPath: `${document.title}.md`,
    filters: [{ name: 'Markdown Files', extensions: ['md'] }]
  });
  if (pathToSave) {
    try {
      const destDir = _path2.default.dirname(pathToSave);
      const fileName = _path2.default.basename(pathToSave);
      await exportNote(document, destDir, fileName);
    } catch (e) {
      console.error('Failed to export:', e);
      inkdrop.notifications.addError('Failed to export', {
        detail: e.message,
        dismissable: true
      });
    }
  }
}

async function exportNote(note, pathToSave, fileName) {
  if (note.body) {
    const datestr = (0, _moment2.default)(note.createdAt).format('YYYYMMDD');
    fileName = fileName || (0, _sanitizeFilename2.default)(datestr + '-' + note.title) + '.md';
    const filePath = _path2.default.join(pathToSave, fileName);
    let body = note.body;

    // find attachments
    const uris = body.match(/inkdrop:\/\/file:[^\) ]*/g) || [];
    for (let i = 0; i < uris.length; ++i) {
      const uri = uris[i];
      const imagePath = await exportImage(uri, pathToSave);
      if (imagePath) {
        body = body.replace(uri, imagePath);
      }
    }

    _fs2.default.writeFileSync(filePath, body);
    _touch2.default.sync(filePath, { time: new Date(note.updatedAt) });
  }
}

async function exportImage(uri, pathToSave) {
  try {
    const file = await inkdrop.models.File.getDocumentFromUri(uri);
    return file.saveFileSync(pathToSave);
  } catch (e) {
    console.error('Failed to export image file:', e);
    return false;
  }
}
