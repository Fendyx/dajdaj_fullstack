import { useEffect, useState, useRef } from 'react';
import { FaStar, FaUpload, FaImage, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../slices/cartSlice';
import { saveOrderToDB } from '../../utils/db'; 
import './PersonalFigurine.css';

// Путь к видео
const videoSrc = 'https://www.youtube.com/watch?embeds_referring_euri=https%3A%2F%2Frandom-ize.com%2F&source_ve_path=Mjg2NjQsMTY0NTAz&v=zONW46d50A0&feature=youtu.be';

// Путь к заглушке для корзины (чтобы не переполнять память)
// Убедись, что этот файл есть в папке public (у тебя в дереве был dajdaj_logo1.png)
const CART_PLACEHOLDER_IMAGE = '/dajdaj_logo1.png'; 

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// --- UI Components ---
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
          error
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

// --- MAIN COMPONENT ---
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
      // 1. Конвертация картинок в Base64
      const base64Images = await Promise.all(
        selectedFiles.map(file => convertToBase64(file))
      );

      // 2. Создаем уникальный ID для хранилища
      const tempId = `custom_${Date.now()}`;
      
      // 3. Формируем "тяжелый" объект ТОЛЬКО для IndexedDB
      const heavyData = {
        id: tempId, 
        inscription: inscription,
        images: base64Images, // <--- Тут лежат большие файлы
        timestamp: Date.now()
      };

      // 4. Сохраняем в IndexedDB (нет лимита памяти)
      await saveOrderToDB(heavyData);

      // 5. Формируем "легкий" объект для Redux/Корзины
      return {
        id: "personal-figurine-custom", 
        name: "Personalized 3D Figurine",
        price: 99,
        // !!! ИСПРАВЛЕНИЕ ТУТ !!!
        // Мы НЕ кладем base64Images[0] в Redux, потому что он > 5МБ и ломает LocalStorage.
        // Используем заглушку. В корзине юзер увидит логотип, но заказ все равно будет с фото.
        image: CART_PLACEHOLDER_IMAGE, 
        cartQuantity: 1,
        tempStorageId: tempId, // Ссылка на тяжелые данные
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
      // alert("Added to cart successfully!"); 
      // Лучше редирект в корзину, чтобы юзер видел результат
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