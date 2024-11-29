<?php
// Proxy script
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL verification for simplicity
    $response = curl_exec($ch);
    curl_close($ch);
    echo $response;
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="../media/my-photo.jpg" type="image/x-icon">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SHAHID</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    iframe {
      border: none;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <!-- Replace 'http://example.com' with the URL you want to load -->
  <iframe src="index.php?url=https://shahid24x7.free.nf/"></iframe>
</body>
</html>
