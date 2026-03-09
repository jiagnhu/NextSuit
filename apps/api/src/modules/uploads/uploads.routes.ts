import crypto from "crypto";
import fs from "fs";
import path from "path";

import multer from "multer";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../../config/env.js";
import { requireAuth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";

const imagesDir = path.resolve(process.cwd(), "uploads", "images");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, imagesDir),
    filename: (_req, file, callback) => {
      const extFromMime = mimeToExt[file.mimetype];
      const extFromOriginal = path.extname(file.originalname || "").toLowerCase();
      const extension = (extFromMime ?? extFromOriginal) || ".jpg";
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Only image files are allowed", 400, "INVALID_FILE_TYPE"));
      return;
    }

    callback(null, true);
  }
});

export const uploadsRouter = Router();

uploadsRouter.post(
  "/images",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("File is required", 400, "FILE_REQUIRED");
    }

    const imageUrl = `${env.PUBLIC_BASE_URL}/uploads/images/${req.file.filename}`;

    res.status(StatusCodes.CREATED).json(
      ok({
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype
      })
    );
  })
);
