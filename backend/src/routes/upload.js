const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const supabase = require('../utils/supabase');

// POST /api/upload/profile
router.post('/profile', authenticate, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const fileExt = file.originalname.split('.').pop();
    const fileName = `profile_${req.user.id}_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { data, error } = await supabase.storage
      .from('naijagig-images') // bucket in Supabase must be created beforehand
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('naijagig-images')
      .getPublicUrl(filePath);

    // Update user's profileImage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: urlData.publicUrl }
    });

    res.json({ success: true, url: urlData.publicUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// POST /api/upload/job-proof/:bookingId
router.post('/job-proof/:bookingId', authenticate, upload.array('photos', 4), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ success: false, error: 'No files uploaded' });

    const uploadedUrls = [];
    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `job_${bookingId}_${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `job-proofs/${fileName}`;
      const { error } = await supabase.storage
        .from('naijagig-images')
        .upload(filePath, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('naijagig-images').getPublicUrl(filePath);
      uploadedUrls.push(urlData.publicUrl);
    }
    res.json({ success: true, urls: uploadedUrls });
  } catch (error) {
    // console.error(error);
    // res.status(500).json({ success: false, error: 'Upload failed' });
     console.error('Upload error details:', error);
  res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;