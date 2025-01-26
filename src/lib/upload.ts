import multer from 'multer';
import path from 'path';
import slugify from 'slugify';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    let uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    if(typeof req.body.title === "string" && req.body.title.trim() !== "") {
        uniqueSuffix = slugify(req.body.title.trim(), {lower: true, strict: true}) + '-' + Date.now();
    }
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to allow only certain file types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. '+allowedTypes.join(', ')+' are allowed.'));
  }
};

// Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * (1024 * 1024) }, // Limit file size to 5MB
});

export default upload;