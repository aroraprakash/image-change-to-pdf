const { jsPDF } = window.jspdf;
const imageInput = document.getElementById('imageInput');
const convertBtn = document.getElementById('convertBtn');
const preview = document.getElementById('preview');
const status = document.getElementById('status');

let selectedImages = [];

imageInput.addEventListener('change', (e) => {
    selectedImages = Array.from(e.target.files);
    showPreview();
    convertBtn.disabled = selectedImages.length === 0;
    status.textContent = '';
    status.className = '';
});

function showPreview() {
    preview.innerHTML = '';
    selectedImages.forEach((file) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    });
}

convertBtn.addEventListener('click', async () => {
    if (selectedImages.length === 0) return;

    convertBtn.disabled = true;
    convertBtn.textContent = 'Converting...';
    status.textContent = 'Creating PDF...';
    status.className = 'status';

    try {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const imgData = await getImageData(file);
            
            if (i > 0) pdf.addPage();

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pageWidth - 40;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'JPEG', 20, 20, pdfWidth, pdfHeight);
        }

        pdf.save('images-to-pdf.pdf');
        status.textContent = `✅ PDF Ready! (${selectedImages.length} images)`;
        status.className = 'status success';
        
    } catch (error) {
        status.textContent = '❌ Error: ' + error.message;
        status.className = 'status error';
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert to PDF';
    }
});

function getImageData(file) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const maxSize = 1000;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
