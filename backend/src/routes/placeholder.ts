import express from 'express';

const router = express.Router();

// Placeholder image endpoint
router.get('/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="16">
        ${width} × ${height}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Placeholder video endpoint
router.get('/placeholder/video/:filename', (req, res) => {
  // Return a minimal MP4 header for video placeholder
  const filename = req.params.filename;
  
  if (filename.endsWith('.mp4')) {
    // Create a minimal valid MP4 response
    const mp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D,
      0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
    ]);
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', mp4Header.length);
    res.send(mp4Header);
  } else {
    res.status(404).json({
      success: false,
      message: 'Video file not found',
      filename: filename
    });
  }
});

export { router as placeholderRoutes };
