import { useEffect, useState, useRef } from 'react';
import { 
  FaStar, 
  FaCloudUploadAlt, 
  FaImage, 
  FaShoppingCart, 
  FaCreditCard, 
  FaMagic, 
  FaTruck, 
  FaCheckCircle 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../slices/cartSlice';

// ✅ Убедись, что путь к utils/db правильный!
import { saveOrderToDB } from '../../utils/db'; 
import './PersonalFigurine.css';

const videoSrc = 'https://www.youtube.com/watch?embeds_referring_euri=https%3A%2F%2Frandom-ize.com%2F&source_ve_path=Mjg2NjQsMTY0NTAz&v=zONW46d50A0&feature=youtu.be';
const CART_PLACEHOLDER_IMAGE = '/dajdaj_logo1.png'; 

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// Функция для создания маленькой миниатюры
const createThumbnail = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 150; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
    }
  }, []);
  return (
    <div className="personal-fi-video-player">
      <div className="personal-fi-main-video">
        <video 
          ref={videoRef} 
          src={src} 
          className="personal-fi-video" 
          autoPlay muted loop playsInline 
          style={{ pointerEvents: 'none', userSelect: 'none', width: '100%', height: 'auto' }}
        >
        </video>
      </div>
    </div>
  );
}

// Новый компонент визуализации процесса
function ProcessSteps() {
  return (
    <div className="personal-fi-steps-container">
      <div className="personal-fi-step">
        <div className="personal-fi-step-icon-box">
          <FaCloudUploadAlt />
        </div>
        <span className="personal-fi-step-title">1. Upload Photo</span>
        <span className="personal-fi-step-desc">Your face or pose</span>
      </div>
      <div className="personal-fi-step-arrow">→</div>
      <div className="personal-fi-step">
        <div className="personal-fi-step-icon-box">
          <FaMagic />
        </div>
        <span className="personal-fi-step-title">2. We Create</span>
        <span className="personal-fi-step-desc">Custom 3D Model</span>
      </div>
      <div className="personal-fi-step-arrow">→</div>
      <div className="personal-fi-step">
        <div className="personal-fi-step-icon-box">
          <FaTruck />
        </div>
        <span className="personal-fi-step-title">3. Delivery</span>
        <span className="personal-fi-step-desc">~7 Days</span>
      </div>
    </div>
  );
}

function UploadSection({ selectedFiles, onFilesChange, inscription, onInscriptionChange }) {
  const handleFileChange = (e) => {
    if (e.target.files) onFilesChange(Array.from(e.target.files));
  };
  
  // Добавляем класс активности, если файлы выбраны
  const containerClass = selectedFiles.length > 0 
    ? "personal-fi-upload-area personal-fi-upload-success" 
    : "personal-fi-upload-area";

  return (
    <div className="personal-fi-upload-section" id="upload-section">
      <div className="personal-fi-section-header">
        <h3>Step 1: Upload Your Photos</h3>
        <span className="personal-fi-badge-required">Required</span>
      </div>
      
      <div className="personal-fi-upload-field">
        <div className="personal-fi-upload-container">
          <input 
            id="photo-upload" 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            className="personal-fi-file-input" 
          />
          <label htmlFor="photo-upload" className={containerClass}>
            {selectedFiles.length > 0 ? (
              <FaCheckCircle className="personal-fi-upload-icon-success" />
            ) : (
              <FaCloudUploadAlt className="personal-fi-upload-icon" />
            )}
            <p className="personal-fi-upload-text">
              {selectedFiles.length > 0 ? "Photos Loaded!" : "Tap here to upload your photos"}
            </p>
            <p className="personal-fi-upload-hint">Selfies, full body, or any clear image</p>
          </label>
        </div>
        {selectedFiles.length > 0 && (
          <div className="personal-fi-selected-files">
            {selectedFiles.map((file, index) => (
              <div key={index} className="personal-fi-file-item">
                <FaImage className="personal-fi-file-icon" />
                <span className="personal-fi-file-name">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="personal-fi-separator"></div>

      <div className="personal-fi-inscription-field">
        <label htmlFor="inscription" className="personal-fi-inscription-label">Base Inscription (Optional)</label>
        <input 
          id="inscription" 
          type="text" 
          placeholder="E.g. 'Super Dad' or 'Happy Birthday'" 
          value={inscription} 
          onChange={(e) => onInscriptionChange(e.target.value)} 
          maxLength={50} 
          className="personal-fi-inscription-input" 
        />
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return <span className={`personal-fi-badge ${className}`}>{children}</span>;
}

export default function PersonalFigurine() {
  const [isSticky, setIsSticky] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [inscription, setInscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const infoCardRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => {
      if (infoCardRef.current) {
        const infoCardRect = infoCardRef.current.getBoundingClientRect();
        // Скрываем стики кнопки, когда доскроллили до подвала/низа
        if (infoCardRect.top <= window.innerHeight - 100) setIsSticky(false);
        else setIsSticky(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const prepareProductData = async () => {
    if (selectedFiles.length === 0) {
      // Плавный скролл к секции загрузки, если забыли фото
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
      alert("Please upload at least one photo to continue!");
      return null;
    }

    setIsLoading(true);

    try {
      const fullSizeImages = await Promise.all(
        selectedFiles.map(file => convertToBase64(file))
      );

      let thumbnailImage = CART_PLACEHOLDER_IMAGE;
      if (selectedFiles.length > 0) {
        try {
          thumbnailImage = await createThumbnail(selectedFiles[0]);
        } catch (err) {
          console.warn("Thumbnail failed");
        }
      }

      const tempId = `custom_${Date.now()}`;
      
      const heavyData = {
        id: tempId, 
        inscription: inscription,
        images: fullSizeImages,
        timestamp: Date.now()
      };

      await saveOrderToDB(heavyData);

      return {
        id: "17",         
        name: "Personal Figurine",
        price: 99,
        image: thumbnailImage,
        cartQuantity: 1,
        tempStorageId: tempId, 
        isCustom: true
      };

    } catch (error) {
      console.error("Processing error:", error);
      alert("Error saving files. Please try again.");
      setIsLoading(false);
      return null;
    }
  };

  const handleAddToCart = async () => {
    const item = await prepareProductData();
    if (item) {
      dispatch(addToCart(item));
      setIsLoading(false);
      navigate("/cart");
    }
  };

  const handleBuyNow = async () => {
    const item = await prepareProductData();
    if (item) {
      navigate('/checkout-stripe', { state: { buyNowItem: item } });
      setIsLoading(false);
    }
  };

  return (
    <div className="personal-fi-app-container">
      <div className="personal-fi-main-content">
        <div className="personal-fi-content-grid">
          {/* Левая колонка - Видео */}
          <div><VideoPlayer src={videoSrc} /></div>

          {/* Правая колонка - Инфо */}
          <div className="personal-fi-product-info">
            <div className="personal-fi-product-header">
              <div className="personal-fi-header-top">
                <div>
                  <Badge className="personal-fi-custom-badge">Custom Made</Badge>
                  <h2 className="personal-fi-product-title">Personalized 3D Figurine</h2>
                </div>
                <div className="personal-fi-rating">
                  {[1, 2, 3, 4, 5].map((star) => <FaStar key={star} className="personal-fi-star-icon" />)}
                  <span className="personal-fi-rating-count">(127 reviews)</span>
                </div>
              </div>
              <div className="personal-fi-price-container">
                <span className="personal-fi-current-price">99 PLN</span>
                <span className="personal-fi-delivery-info">Ready in ~7 Days</span>
              </div>
            </div>

            {/* 🔥 НОВЫЙ БЛОК: КАК ЭТО РАБОТАЕТ 🔥 */}
            <ProcessSteps />

            {/* Секция загрузки */}
            <UploadSection 
              selectedFiles={selectedFiles} 
              onFilesChange={setSelectedFiles}
              inscription={inscription}
              onInscriptionChange={setInscription}
            />

            {/* Кнопки */}
            <div className={`personal-fi-sticky-button-container ${isSticky ? 'personal-fi-sticky-active' : 'personal-fi-sticky-stop'}`}>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button 
                  className="personal-fi-btn" 
                  style={{ flex: 1, backgroundColor: '#fff', color: '#000', border: '1px solid #ddd' }}
                  onClick={handleAddToCart}
                  disabled={isLoading}
                >
                  <FaShoppingCart style={{ marginRight: '8px' }} />
                  {isLoading ? '...' : 'Add to Cart'}
                </button>

                <button 
                  className="personal-fi-btn personal-fi-pay-button" 
                  style={{ flex: 1 }}
                  onClick={handleBuyNow}
                  disabled={isLoading}
                >
                  <FaCreditCard style={{ marginRight: '8px' }} />
                  {isLoading ? 'Processing...' : 'Order Now'}
                </button>
              </div>
            </div>

            <div className="personal-fi-info-card" ref={infoCardRef}>
              <ul className="personal-fi-info-list">
                <li>✓ High-quality resin 3D printing</li>
                <li>✓ Hand-finished details</li>
                <li>✓ Secure shipping in protective box</li>
                <li>✓ 100% Satisfaction Guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}