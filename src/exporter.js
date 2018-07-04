import { remote } from 'electron'
import path from 'path'
import sanitize from 'sanitize-filename'
import fs from 'fs'
import touch from 'touch'
import moment from 'moment'
const { dialog, app } = remote

export async function exportSingleNote() {
  const { document } = inkdrop.flux.getStore('editor').getState()
  const pathToSave = dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: `${document.title}.md`,
    filters: [{ name: 'Markdown Files', extensions: ['md'] }]
  })
  if (pathToSave) {
    try {
      const destDir = path.dirname(pathToSave)
      const fileName = path.basename(pathToSave)
      await exportNote(document, destDir, fileName)
    } catch (e) {
      console.error('Failed to export:', e)
      inkdrop.notifications.addError('Failed to export', {
        detail: e.message,
        dismissable: true
      })
    }
  }
}

export async function exportNote(note, pathToSave, fileName) {
  if (note.body) {
    const datestr = moment(note.createdAt).format('YYYYMMDD')
    fileName = fileName || sanitize(datestr + '-' + note.title) + '.md'
    const filePath = path.join(pathToSave, fileName)

    // find attachments
    const uris = body.match(/inkdrop:\/\/file:[^\) ]*/g) || []
    for (let i = 0; i < uris.length; ++i) {
      const uri = uris[i]
      const imagePath = await exportImage(uri, pathToSave)
      if (imagePath) {
        body = body.replace(uri, imagePath)
      }
    }

    fs.writeFileSync(filePath, body)
    touch.sync(filePath, { time: new Date(note.updatedAt) })
  }
}

export async function exportImage(uri, pathToSave) {
  try {
    const file = await inkdrop.models.File.getDocumentFromUri(uri)
    return file.saveFileSync(pathToSave)
  } catch (e) {
    console.error('Failed to export image file:', e)
    return false
  }
}
