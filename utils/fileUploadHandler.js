/* eslint-disable no-undef */
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




async function handleUpload(req, res) {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldres = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      transformation: [
        { quality: '50' }
      ],
    });
    res.json(cldres);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
    });
  }
}

async function handleDelete(req, res) {
  try {
    const { publicId } = req.body;
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Image deletion failed' });
    }
  } catch{
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

export { handleUpload, handleDelete };