TOUR VIDEOS
═══════════

Drop your tour video files into this folder, named after each tool:

  videos/student-picker.mp4
  videos/seating-arranger.mp4
  videos/behavior-chart.mp4
  videos/good-noodles.mp4
  videos/timer.mp4

(.webm also works — just match the path you enter in the config.)

Then open index.html (the homepage) and find the TOUR_VIDEOS block near
the bottom of the file. Replace null with the path for each video:

  const TOUR_VIDEOS = {
    'student-picker':   'videos/student-picker.mp4',
    'seating-arranger': null,        <-- still shows the placeholder
    ...
  };

Any entry left as null — or pointing at a file that doesn't exist —
automatically shows a "Video coming soon" placeholder in the tour.

Tips:
  • Keep files small (under ~10 MB) so the tour loads fast on school Wi-Fi.
  • MP4 (H.264) plays everywhere; 1280×720 is plenty for a walkthrough.
  • Videos start muted and with controls, so autoplay is allowed.
