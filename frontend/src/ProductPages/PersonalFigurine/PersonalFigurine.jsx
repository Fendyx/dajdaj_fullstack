import { useEffect, useState, useRef } from 'react';
import { FaStar, FaUpload, FaImage, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
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

// Функция для создания маленькой миниатюры (до 100px)
const createThumbnail = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Максимальный размер иконки в корзине (например, 150px)
        const maxSize = 150; 
        let width = img.width;
        let height = img.height;

        // Пропорциональное уменьшение
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

        // Рисуем уменьшенное изображение
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в JPEG с качеством 0.7 (сильное сжатие)
        // Получится строка размером 3-10 КБ вместо 2 МБ
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

function UploadSection({ selectedFiles, onFilesChange, inscription, onInscriptionChange }) {
  const handleFileChange = (e) => {
    if (e.target.files) onFilesChange(Array.from(e.target.files));
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
          <label htmlFor="photo-upload" className="personal-fi-upload-area">
            <FaUpload className="personal-fi-upload-icon" />
            <p className="personal-fi-upload-text">Click to upload or drag and drop</p>
            <p className="personal-fi-upload-hint">PNG, JPG (No size limit)</p>
          </label>
        </div>
        {selectedFiles.length > 0 && (
          <div className="personal-fi-selected-files">
            {selectedFiles.map((file, index) => (
              <div key={index} className="personal-fi-file-item">
                <FaImage className="personal-fi-file-icon" />
                <span className="personal-fi-file-name">{file.name}</span>
                <span className="personal-fi-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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
          onChange={(e) => onInscriptionChange(e.target.value)} 
          maxLength={50} 
          className="personal-fi-inscription-input" 
        />
        <p className="personal-fi-character-count">{inscription.length}/50 characters</p>
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
      alert("Please upload at least one photo!");
      return null;
    }

    setIsLoading(true);

    try {
      // 1. Для IndexedDB (тяжелые данные) конвертируем как есть (оригиналы)
      // Можно оставить твой старый метод convertToBase64, 
      // но лучше сохранять только то, что нужно.
      // Если у тебя convertToBase64 уже есть выше, используем его для DB.
      const fullSizeImages = await Promise.all(
        selectedFiles.map(file => convertToBase64(file))
      );

      // 2. А вот для КОРЗИНЫ создаем легкую миниатюру только из первого файла
      let thumbnailImage = CART_PLACEHOLDER_IMAGE;
      if (selectedFiles.length > 0) {
        try {
          thumbnailImage = await createThumbnail(selectedFiles[0]);
          console.log("Thumbnail created, length:", thumbnailImage.length); // Для проверки размера
        } catch (err) {
          console.warn("Thumbnail creation failed, using placeholder");
        }
      }

      const tempId = `custom_${Date.now()}`;
      
      // Сохраняем ТЯЖЕЛЫЕ оригиналы в базу
      const heavyData = {
        id: tempId, 
        inscription: inscription,
        images: fullSizeImages, // Оригиналы высокого качества
        timestamp: Date.now()
      };

      await saveOrderToDB(heavyData);
      console.log(`✅ [PersonalFigurine] Saved to DB: ${tempId}`);

      return {
        id: "17",         
        name: "Personal Figurine",
        price: 99,
        image: thumbnailImage, // 👈 Сюда идет сжатая картинка (5-10 КБ)
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
    console.log("🚀 Нажата кнопка Buy Now");
    const item = await prepareProductData();
    
    if (item) {
      console.log("👉 Переход на checkout с товаром:", item);
      // Передаем item через state роутера
      navigate('/checkout-stripe', { state: { buyNowItem: item } });
      setIsLoading(false);
    } else {
      console.warn("⚠️ Item creation failed");
    }
  };

  return (
    <div className="personal-fi-app-container">
      <header className="personal-fi-header">
        <div className="personal-fi-header-content">
          <h1>3D Figurines Marketplace</h1>
        </div>
      </header>

      <main className="personal-fi-main-content">
        <div className="personal-fi-content-grid">
          <div><VideoPlayer src={videoSrc} /></div>

          <div className="personal-fi-product-info">
            <div className="personal-fi-product-header">
              <div className="personal-fi-header-top">
                <div>
                  <Badge className="personal-fi-custom-badge">Custom Made</Badge>
                  <h2 className="personal-fi-product-title">Personalized 3D Figurine</h2>
                </div>
                <div className="personal-fi-rating">
                  {[1, 2, 3, 4, 5].map((star) => <FaStar key={star} className="personal-fi-star-icon" />)}
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
                 <p>Upload your photos and we will create a custom 3D model for you.</p>
              </div>
            </div>

            <UploadSection 
              selectedFiles={selectedFiles} 
              onFilesChange={setSelectedFiles}
              inscription={inscription}
              onInscriptionChange={setInscription}
            />

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
                  className="personal-fi-btn" 
                  style={{ flex: 1 }}
                  onClick={handleBuyNow}
                  disabled={isLoading}
                >
                  <FaCreditCard style={{ marginRight: '8px' }} />
                  {isLoading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>

            <div className="personal-fi-info-card" ref={infoCardRef}>
              <ul>
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