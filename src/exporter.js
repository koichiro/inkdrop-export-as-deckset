import { remote } from 'electron'
import path from 'path'
import sanitize from 'sanitize-filename'
import fs from 'fs'
import touch from 'touch'
import moment from 'moment'
import { logger } from 'inkdrop'
import { replaceImages } from 'inkdrop-export-utils'
const { dialog } = remote

export async function exportSingleNote() {
  const { editingNote } = inkdrop.store.getState()
  const pathToSave = dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: `${editingNote.title}.md`,
    filters: [{ name: 'Markdown Files', extensions: ['md'] }]
  })
  if (pathToSave) {
    try {
      const destDir = path.dirname(pathToSave)
      const fileName = path.basename(pathToSave)
      await exportNote(editingNote, destDir, fileName)
    } catch (e) {
      logger.error('Failed to export editing note:', e, editingNote)
      inkdrop.notifications.addError('Failed to export editing note', {
        detail: e.message,
        dismissable: true
      })
    }
  }
}

export async function exportNote(note, pathToSave, fileName) {
  if (note.body) {
    const datestr = moment(note.createdAt).format('YYYYMMDD')
    fileName =
      fileName ||
      sanitize(datestr + '-' + note.title + '-' + note._id.substr(5)) + '.md'
    const filePath = path.join(pathToSave, fileName)
    let body = note.body
    body = await replaceImages(body, pathToSave, pathToSave)

    fs.writeFileSync(filePath, body)
    touch.sync(filePath, { time: new Date(note.updatedAt) })
  }
}
