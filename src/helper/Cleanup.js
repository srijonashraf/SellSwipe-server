import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to clean up
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Time in milliseconds after which files will be deleted (e.g., 2 min)
const FILE_LIFETIME = 60 * 2 * 1000;

export const cleanupUploads = () => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${UPLOAD_DIR}:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(UPLOAD_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of file ${filePath}:`, err);
          return;
        }

        const now = Date.now();
        const endTime = new Date(stats.mtime).getTime() + FILE_LIFETIME;

        if (now > endTime) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            } else {
              console.log(`Deleted file ${filePath}`);
            }
          });
        }
      });
    });
  });
};
