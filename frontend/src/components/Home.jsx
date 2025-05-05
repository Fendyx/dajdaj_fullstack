import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { addToCart } from "../slices/cartSlice";
import { useGetAllProductsQuery } from "../slices/productsApi";
import { Link } from "react-router-dom";

const Home = () => {
  const { items: products, status } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, error, isLoading } = useGetAllProductsQuery();

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // не даём всплыть клику до карточки
    dispatch(addToCart(product));
    navigate("/cart");
  };

  const handleCardClick = (link, e) => {
    // если клик был по кнопке или ссылке — ничего не делаем
    if (
      e.target.closest("button") || 
      e.target.closest("a")
    ) return;
    
    navigate(link);
  };

  return (
    <div className="home-container">
      {status === "success" ? (
        <>
          <div className="background-quote">
            <p className="hero-text">
              A one-of-a-kind gift for your loved one and beyond! Be unforgettable — give a piece of your heart
            </p>
          </div>
          <div className="products">
            {data &&
              data.map((product) => (
                <div
                  key={product.id}
                  className="product"
                  onClick={(e) => handleCardClick(product.link, e)}
                >
                  <h3>{product.name}</h3>
                  <img src={product.image} alt={product.name} />
                  <div className="details">
                    <span>{product.desc}</span>
                    <span className="price">${product.price}</span>
                  </div>
                  <div>
                    <Link
                      to={product.link}
                      className="learn-more"
                      onClick={(e) => e.stopPropagation()} // чтобы не было перехода двойного
                    >
                      Show more
                    </Link>
                    <button onClick={(e) => handleAddToCart(product, e)}>
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : status === "pending" ? (
        <p>Loading...</p>
      ) : (
        <p>Unexpected error occurred...</p>
      )}
    </div>
  );
};

export default Home;
