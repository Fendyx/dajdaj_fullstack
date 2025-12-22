import { useEffect, useState, useRef } from 'react';
import { FaStar, FaUpload, FaImage } from 'react-icons/fa';
import './PersonalFigurine.css';

// Заменим массив изображений на путь к видео
const videoSrc = 'https://www.youtube.com/watch?embeds_referring_euri=https%3A%2F%2Frandom-ize.com%2F&source_ve_path=Mjg2NjQsMTY0NTAz&v=zONW46d50A0&feature=youtu.be'; // Путь к видео в папке public

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Принудительный запуск (на случай если autoPlay не сработает сразу)
    if (videoRef.current) {
      // Важно: видео должно быть muted, чтобы play() сработал автоматически в большинстве браузеров
      videoRef.current.play().catch(error => {
        console.log('Автозапуск видео заблокирован:', error);
      });
    }
  }, []);

  return (
    <div className="personal-fi-video-player">
      <div className="personal-fi-main-video">
        <video
          ref={videoRef}
          src={src} // Используем проп src или переменную videoSrc напрямую
          className="personal-fi-video"
          
          // Основные настройки
          autoPlay
          muted
          loop
          playsInline // Важно для iPhone, чтобы не открывалось на весь экран
          
          // УБРАЛИ атрибут controls
          
          // Блокируем любые клики по видео
          style={{ 
            pointerEvents: 'none', 
            userSelect: 'none',
            width: '100%', // На всякий случай, если стили не подтянулись из CSS
            height: 'auto'
          }}
        >
          error
        </video>
      </div>
    </div>
  );
}

function UploadSection() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [inscription, setInscription] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="personal-fi-upload-section" id="upload-section">
      <h3>Upload Your Data for 3D Model Generation</h3>

      <div className="personal-fi-upload-field">
        <label htmlFor="photo-upload" className="personal-fi-upload-label">Upload Photos</label>
        <div className="personal-fi-upload-container">
          <input
            id="photo-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="personal-fi-file-input"
          />
          <label
            htmlFor="photo-upload"
            className="personal-fi-upload-area"
          >
            <FaUpload className="personal-fi-upload-icon" />
            <p className="personal-fi-upload-text">
              Click to upload or drag and drop
            </p>
            <p className="personal-fi-upload-hint">PNG, JPG up to 10MB</p>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="personal-fi-selected-files">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="personal-fi-file-item"
              >
                <FaImage className="personal-fi-file-icon" />
                <span className="personal-fi-file-name">{file.name}</span>
                <span className="personal-fi-file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="personal-fi-inscription-field">
        <label htmlFor="inscription" className="personal-fi-inscription-label">Base Inscription (Optional)</label>
        <input
          id="inscription"
          type="text"
          placeholder="Enter text for the base..."
          value={inscription}
          onChange={(e) => setInscription(e.target.value)}
          maxLength={50}
          className="personal-fi-inscription-input"
        />
        <p className="personal-fi-character-count">
          {inscription.length}/50 characters
        </p>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return <span className={`personal-fi-badge ${className}`}>{children}</span>;
}

function Button({ children, className, size }) {
  const sizeClass = size === 'lg' ? 'personal-fi-btn-large' : '';
  return <button className={`personal-fi-btn ${sizeClass} ${className}`}>{children}</button>;
}

export default function PersonalFigurine() {
  const [isSticky, setIsSticky] = useState(true);
  const infoCardRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (infoCardRef.current) {
        const infoCardRect = infoCardRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Если верх info-card выше чем низ экрана минус 100px, отключаем sticky
        if (infoCardRect.top <= windowHeight - 100) {
          setIsSticky(false);
        } else {
          setIsSticky(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Проверяем сразу

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="personal-fi-app-container">
      <header className="personal-fi-header">
        <div className="personal-fi-header-content">
          <h1>3D Figurines Marketplace</h1>
        </div>
      </header>

      <main className="personal-fi-main-content">
        <div className="personal-fi-content-grid">
          <div>
            <VideoPlayer src={videoSrc} />
          </div>

          <div className="personal-fi-product-info">
            <div className="personal-fi-product-header">
              <div className="personal-fi-header-top">
                <div>
                  <Badge className="personal-fi-custom-badge">Custom Made</Badge>
                  <h2 className="personal-fi-product-title">Personalized 3D Figurine</h2>
                </div>
                <div className="personal-fi-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="personal-fi-star-icon" />
                  ))}
                  <span className="personal-fi-rating-count">(127)</span>
                </div>
              </div>

              <div className="personal-fi-price-container">
                <span className="personal-fi-current-price">99 PLN</span>
                <span className="personal-fi-old-price">149 PLN</span>
              </div>
            </div>

            <div className="personal-fi-description-card">
              <h3>Perfect for:</h3>
              
              <div className="personal-fi-options-list">
                <div className="personal-fi-option-item">
                  <div className="personal-fi-option-number personal-fi-option-number-1">1</div>
                  <div className="personal-fi-option-content">
                    <p className="personal-fi-option-title">Athletic Figure Generation</p>
                    <p className="personal-fi-option-description">
                      Create a custom sports-themed figurine in your favorite athletic pose
                    </p>
                  </div>
                </div>

                <div className="personal-fi-option-item">
                  <div className="personal-fi-option-number personal-fi-option-number-2">2</div>
                  <div className="personal-fi-option-content">
                    <p className="personal-fi-option-title">Couple Figurines Generation</p>
                    <p className="personal-fi-option-description">
                      Perfect gift for couples - create matching figurines for you and your loved one
                    </p>
                  </div>
                </div>

                <div className="personal-fi-option-item">
                  <div className="personal-fi-option-number personal-fi-option-number-3">3</div>
                  <div className="personal-fi-option-content">
                    <p className="personal-fi-option-title">Any Person Generation</p>
                    <p className="personal-fi-option-description">
                      Fully customizable - turn any photo into a stunning 3D figurine
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <UploadSection />

            <div className={`personal-fi-sticky-button-container ${isSticky ? 'personal-fi-sticky-active' : 'personal-fi-sticky-stop'}`}>
              <Button className="personal-fi-pay-button" size="lg">Pay Now</Button>
            </div>

            <div className="personal-fi-info-card" ref={infoCardRef}>
              <ul className="personal-fi-info-list">
                <li>✓ High-quality 3D printing</li>
                <li>✓ Delivery within 7-14 business days</li>
                <li>✓ Free shipping on orders over 500 PLN</li>
                <li>✓ Satisfaction guaranteed or money back</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}