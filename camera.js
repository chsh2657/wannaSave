// 📷 카메라 기능 관리

const CameraManager = {
    video: null,
    canvas: null,
    stream: null,
    currentPhoto: null,

    /**
     * 카메라 초기화
     */
    async init() {
        this.video = document.getElementById('cameraPreview');
        this.canvas = document.getElementById('photoCanvas');
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            this.video.srcObject = this.stream;
        } catch (error) {
            console.error('카메라 접근 실패:', error);
            showToast('카메라에 접근할 수 없습니다. 권한을 확인해주세요.', 'error');
        }
    },

    /**
     * 사진 촬영
     */
    capturePhoto() {
        if (!this.video) return null;

        const ctx = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // 좌우 반전 수정
        ctx.translate(this.canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.video, 0, 0);

        this.currentPhoto = this.canvas.toDataURL('image/jpeg', 0.95);
        return this.currentPhoto;
    },

    /**
     * 촬영한 사진 표시
     */
    displayPhoto() {
        const capturedPhotoDiv = document.getElementById('capturedPhoto');
        if (this.currentPhoto) {
            capturedPhotoDiv.innerHTML = `<img src="${this.currentPhoto}" alt="촬영한 사진">`;
            capturedPhotoDiv.style.display = 'block';
            this.video.style.display = 'none';
        }
    },

    /**
     * 다시 촬영
     */
    resetCamera() {
        const capturedPhotoDiv = document.getElementById('capturedPhoto');
        this.video.style.display = 'block';
        capturedPhotoDiv.style.display = 'none';
        this.currentPhoto = null;
    },

    /**
     * 카메라 종료
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
};
