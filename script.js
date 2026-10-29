(function() {
    // 1. Tüm ekranı kaplayan simsiyah bir arka plan katmanı oluştur
    const bgOverlay = document.createElement('div');
    bgOverlay.id = 'espBgOverlay';
    bgOverlay.style.position = 'fixed';
    bgOverlay.style.top = '0';
    bgOverlay.style.left = '0';
    bgOverlay.style.width = '100vw';
    bgOverlay.style.height = '100vh';
    bgOverlay.style.backgroundColor = '#000000'; // Tam siyah arka plan
    bgOverlay.style.zIndex = '99998'; // Panelin hemen arkasında kalması için
    document.body.appendChild(bgOverlay);

    // 2. Ana taşıyıcı dönüştürücü kutuyu oluştur ve ekranda ortala
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)'; // Ekranın tam ortasına sabitle
    container.style.zIndex = '99999';
    container.style.backgroundColor = '#1a1a1a';
    container.style.color = '#fff';
    container.style.padding = '25px';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 0 20px rgba(0,255,154,0.2)'; // Hafif yeşil neon gölge
    container.style.fontFamily = 'sans-serif';
    container.style.maxWidth = '370px';
    container.style.textAlign = 'center';
    
    // Başlık
    const title = document.createElement('h3');
    title.style.marginTop = '0';
    title.style.marginBottom = '5px';
    title.style.color = '#00fa9a';
    title.textContent = 'ESP32 320x240 RGB565 Converter';
    container.appendChild(title);

    // Açıklama
    const desc = document.createElement('p');
    desc.style.fontSize = '13px';
    desc.style.color = '#aaa';
    desc.style.marginBottom = '20px';
    desc.textContent = 'Görsel oranını korur, boşlukları siyah yapar.';
    container.appendChild(desc);

    // Dosya yükleme butonu
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'espImageInput';
    input.accept = 'image/*';
    input.style.marginBottom = '15px';
    input.style.color = '#fff';
    input.style.width = '100%';
    container.appendChild(input);

    // Önizleme için Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'espCanvas';
    canvas.width = 320;
    canvas.height = 240;
    canvas.style.border = '2px solid #333';
    canvas.style.backgroundColor = '#000';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto 15px auto';
    container.appendChild(canvas);

    // Kopyalama butonu
    const copyBtn = document.createElement('button');
    copyBtn.id = 'espCopyBtn';
    copyBtn.style.backgroundColor = '#00fa9a';
    copyBtn.style.color = '#000';
    copyBtn.style.border = 'none';
    copyBtn.style.padding = '8px 15px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.fontWeight = 'bold';
    copyBtn.style.width = '100%';
    copyBtn.style.borderRadius = '6px';
    copyBtn.style.fontSize = '14px';
    copyBtn.style.display = 'none';
    copyBtn.textContent = 'Kodu Kopyala';
    container.appendChild(copyBtn);

    // Sayfaya ekle
    document.body.appendChild(container);

    const ctx = canvas.getContext('2d');
    let codeResult = "";

    // Görsel işleme mantığı
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Canvas'ı siyah temizle
                ctx.fillStyle = "#000000";
                ctx.fillRect(0, 0, 320, 240);

                const screenW = 320;
                const screenH = 240;
                const screenAspect = screenW / screenH;
                const imgAspect = img.width / img.height;

                let renderW, renderH, targetX, targetY;

                if (imgAspect > screenAspect) {
                    renderW = screenW;
                    renderH = screenW / imgAspect;
                    targetX = 0;
                    targetY = (screenH - renderH) / 2;
                } else {
                    renderH = screenH;
                    renderW = screenH * imgAspect;
                    targetX = (screenW - renderW) / 2;
                    targetY = 0;
                }

                ctx.drawImage(img, targetX, targetY, renderW, renderH);

                const imgData = ctx.getImageData(0, 0, 320, 240);
                const pixels = imgData.data;
                let cArray = "const uint16_t myImage[] PROGMEM = {\n  ";
                
                for (let i = 0; i < pixels.length; i += 4) {
                    let r = pixels[i];
                    let g = pixels[i+1];
                    let b = pixels[i+2];

                    let r5 = (r >> 3) & 0x1F;
                    let g6 = (g >> 2) & 0x3F;
                    let b5 = (b >> 3) & 0x1F;
                    let rgb565 = (r5 << 11) | (g6 << 5) | b5;

                    let hex = "0x" + rgb565.toString(16).toUpperCase().padStart(4, '0');
                    cArray += hex + ", ";

                    if ((i / 4 + 1) % 16 === 0) {
                        cArray += "\n  ";
                    }
                }
                
                cArray = cArray.trim().replace(/,\s*$/, '') + "\n};";
                codeResult = cArray;
                copyBtn.style.display = "block";
                alert("Dönüştürme tamamlandı! 'Kodu Kopyala' butonuna basabilirsin.");
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Kopyalama butonu mantığı
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(codeResult).then(() => {
            alert("ESP32 uyumlu 16-bit RGB565 dizisi panoya kopyalandı!");
        }).catch(err => {
            console.log(codeResult);
            alert("Otomatik kopyalama engellendi. Kodu yan taraftaki Konsol (Console) kısmından manuel kopyalayabilirsin.");
        });
    });
})();

undefined
