<?php

$folderPath = 'upload/';

error_log(print_r($_FILES['file'], true));

$image_parts = $_FILES['file']['tmp_name'];
$image_type_aux = explode("image/", $_FILES['file']['type']);
$image_type = $image_type_aux[1];

$target_file = $folderPath . uniqid() . '.' . $image_type;
$merged_file = $folderPath . uniqid() . '.' . $image_type;

move_uploaded_file($image_parts, $target_file);

$image_1 = imagecreatefrompng($target_file);
$image_2 = imagecreatefrompng('frames/frame_01.png');
imagealphablending($image_1, true);
imagesavealpha($image_1, true);
imagecopy($image_1, $image_2, 0, 0, 0, 0, 1000, 1000);
imagepng($image_1, $merged_file);

echo json_encode(array('file' => $merged_file));
