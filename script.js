
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageUpload = document.getElementById('imageUpload');
    const downloadBtn = document.getElementById('downloadBtn');
    const status = document.getElementById('status');
  
    const frameImage = new Image();
    const placeholderImage = new Image();
    placeholderImage.src = 'placeholder2.jpg';
    frameImage.src = 'frame/S__100573228.png';
  
    let uploadedImg = null;
    let scale = 1;
    let originX = 0;
    let originY = 0;
  
    let isDragging = false;
    let startX = 0, startY = 0;
  
   
    let lastTouchDistance = 0;
    let lastMidpoint = null;
  
    function renderCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

     

      if (uploadedImg) {
        const drawWidth = uploadedImg.width * scale;
        const drawHeight = uploadedImg.height * scale;
        ctx.drawImage(uploadedImg, originX, originY, drawWidth, drawHeight);
      } else {
        drawPlaceholder(); // placeholder 
      }

      
      ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    }
  
    function drawPlaceholder() {
      const draw = () => {
        const imgAspect = placeholderImage.width / placeholderImage.height;
        const canvasAspect = canvas.width / canvas.height;
  
        let drawWidth, drawHeight, offsetX, offsetY;
        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = placeholderImage.width * (canvas.height / placeholderImage.height);
          offsetX = -(drawWidth - canvas.width) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = placeholderImage.height * (canvas.width / placeholderImage.width);
          offsetX = 0;
          offsetY = -(drawHeight - canvas.height) / 2;
        }
  
        ctx.drawImage(placeholderImage, offsetX, offsetY, drawWidth, drawHeight);
      };
  
      if (placeholderImage.complete) {
        draw();
      } else {
        placeholderImage.onload = draw;
      }
    }
  
    // Mouse drag
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.offsetX;
      startY = e.offsetY;
    });
  
    canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        originX += e.offsetX - startX;
        originY += e.offsetY - startY;
        startX = e.offsetX;
        startY = e.offsetY;
        renderCanvas();
      }
    });
  
    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);
  
    // Desktop scroll zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoom = e.deltaY < 0 ? 1.1 : 0.9;
      scale *= zoom;
      renderCanvas();
    });
  
    // Touch support (pan and pinch zoom)
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        lastTouchDistance = getDistance(e.touches[0], e.touches[1]);
        lastMidpoint = getMidpoint(e.touches[0], e.touches[1]);
      }
    }, { passive: false });
  
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
  
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        originX += dx;
        originY += dy;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        renderCanvas();
      }
  
      if (e.touches.length === 2) {
        const newDistance = getDistance(e.touches[0], e.touches[1]);
        const midpoint = getMidpoint(e.touches[0], e.touches[1]);
  
        const zoom = newDistance / lastTouchDistance;
        scale *= zoom;
        originX -= (midpoint.x - originX) * (zoom - 1);
        originY -= (midpoint.y - originY) * (zoom - 1);
  
        lastTouchDistance = newDistance;
        renderCanvas();
      }
    }, { passive: false });
  
    canvas.addEventListener('touchend', (e) => {
      isDragging = false;
      lastTouchDistance = 0;
    });
  
    function getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
  
    function getMidpoint(touch1, touch2) {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    }
  
    imageUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      if (file.size > 7 * 1024 * 1024) {
        alert("กรุณาอัปโหลดภาพที่มีขนาดไม่เกิน 7MB");
        return;
      }
  
      status.textContent = "กำลังประมวลผลภาพ...";
      downloadBtn.style.display = 'none';
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width > 6000 || img.height > 6000) {
            alert("ขนาดภาพใหญ่เกินไป กรุณาใช้ภาพที่มีขนาดไม่เกิน 6000 x 6000 พิกเซล");
            status.textContent = "";
            return;
          }
  
          uploadedImg = img;
  
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          scale = imgAspect > canvasAspect
            ? canvas.height / img.height
            : canvas.width / img.width;
  
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
  
          originX = (canvas.width - drawWidth) / 2;
          originY = (canvas.height - drawHeight) / 2;
  
          renderCanvas();
          status.textContent = "ลองเลื่อน หรือซูมภาพได้นะ ถ้า OK! แล้วปุ่มดาวน์โหลดจะอยู่ข้างล่าง";
          downloadBtn.style.display = 'inline-block';
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
            document.getElementById('iosNote').style.display = 'block';
            }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  
    downloadBtn.addEventListener('click', () => {
      const imageData = canvas.toDataURL('image/png');
      
      // สร้างลิงก์ดาวน์โหลดแบบชั่วคราว
      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'AmazingThailandLoveWinsFestival.png';  
      link.click();
      document.body.removeChild(link);
    });



  
    // Initial render
    renderCanvas();

    function closeModal() {
      document.getElementById('imagePreviewModal').style.display = 'none';
    }

