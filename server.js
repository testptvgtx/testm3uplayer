const express = require('express');
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ตรวจสอบและสร้างโฟลเดอร์เก็บไฟล์หากยังไม่มี
const uploadDir = path.join(__dirname, 'uploads/playlists');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า Multer สำหรับบันทึกไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`); // เปลี่ยนชื่อไฟล์เป็น ID สุ่มเพื่อความปลอดภัย
  }
});

// ตรวจสอบสิทธิ์เฉพาะไฟล์ .m3u เท่านั้น
const fileFilter = (req, file, cb) => {
    if (file.originalname.endsWith('.m3u')) {
        cb(null, true);
    } else {
        cb(new Error('อนุญาตเฉพาะไฟล์นามสกุล .m3u เท่านั้น!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// เปิดให้เข้าถึงหน้าเว็บในโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// API รับไฟล์จากหน้าบ้าน
app.post('/api/upload-playlist', upload.single('playlist'), (req, res) => {
   if(!req.file) {
       return res.status(400).json({ error: 'กรุณาแนบไฟล์ .m3u' });
   }
   
   // บันทึกสำเร็จ (สามารถเพิ่มโค้ดบันทึกค่าลง MySQL/MongoDB ตรงนี้ได้)
   console.log("บันทึกไฟล์สำเร็จที่:", req.file.path); 
   
   res.json({ 
       message: 'อัปโหลดและบันทึกเข้าโฟลเดอร์ฐานข้อมูลสำเร็จ!', 
       fileId: req.file.filename 
   });
}, (error, req, res, next) => {
    // ดักจับ Error กรณีอัปโหลดไฟล์ผิดประเภท
    res.status(400).json({ error: error.message });
});

app.listen(PORT, () => console.log(`เซิร์ฟเวอร์ทำงานแล้วที่พอร์ต ${PORT}`));
